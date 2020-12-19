import 'jasmine';

import { execFile as execFileCb, ChildProcess } from 'child_process';
import { StatusCodes } from 'http-status-codes';
import killTree from 'tree-kill';
import net from 'net';
import { URL } from 'url';
import { promisify } from 'util';
import * as http from 'rules_prerender/common/http';
import { useForAll } from './effects';

type Signal = Parameters<ChildProcess['kill']>[0];
const execFile = promisify(execFileCb);

/**
 * An effect which initializes a devserver for the given binary path. Handles
 * initialization and cleanup of the server. Uses the same server for multiple
 * tests because it is expected to be generally stable.
 * 
 * Example usage:
 * 
 * ```typescript
 * describe('test suite', () => {
 *   // Handles initialization and cleanup automatically.
 *   const server = useDevserver('path/to/devserver/binary');
 * 
 *   it('is alive', async () => {
 *     const res = await fetch(`http://${server.host}:${server.port}/`);
 *     expect(res.status).toBe(200);
 *   });
 * });
 * ```
 * 
 * @param args Arguments to pass through to {@link Server.spawn}. See
 *     documentation there.
 * @return A proxied {@link Server} instance usable for tests.
 */
export function useDevserver(...args: Parameters<typeof Server.spawn>): Server {
    return useForAll(async () => {
        const server = await Server.spawn(...args);

        return [
            server,
            async () => await server.kill(),
        ] as const;
    });
}

/** A running devserver instance. */
export class Server {
    /** The host the server is running on (typically 'localhost'). */
    public readonly host: string;
    /** The port the server is running on. */
    public readonly port: number;
    /** Kills the child process executing the devserver. */
    public readonly kill: () => Promise<void>;

    /**
     * Constructs a new DevServer representing an already running
     * `ts_devserver()` child process.
     * 
     * @param host The host the devserver is running on (typically 'localhost').
     * @param port The port the devserver is running on.
     * @param kill A function which kills the process running the devserver.
     */
    private constructor({ host, port, kill }: {
        host: string,
        port: number,
        kill: () => Promise<void>,
    }) {
        this.host = host;
        this.port = port;
        this.kill = kill;
    }

    /**
     * Spawns a new instance of a Server with the given binary path.
     * 
     * @param binary Path to a `ts_binary()` executable to invoke which will
     *     start the server. This is usually done via a `data` dependency on a
     *     `ts_devserver()`. The path to a `ts_devserver()` target is
     *     `${runfiles}/${workspaceName}/${pathToDevserverPkg}/${devserverName}`.
     *     For example, a `ts_devserver(name = "my_server")` target in
     *     `path/to/pkg/BUILD` with a `workspace(name = "wksp")` in the root
     *     `WORKSPACE` file would have its binary at
     *     `${process.env['RUNFILES']}/wksp/path/to/pkg/my_server` (don't forget
     *     the `data` dependency on `//path/to/pkg:my_server`!).
     * @param stdout A function to call when receiving data from stdout of the
     *     server.
     * @param stderr A function to call when receiving data from stderr of the
     *     server.
     * @param onError A function to call when receiving an error from the
     *     server.
     */
    public static async spawn(binary: string, {
        stdout = (data) => console.error(`[devserver - stdout] ${data}`),
        stderr = (data) => console.error(`[devserver - stderr] ${data}`),
        onError = (data) => console.error(`[devserver - onError] ${data}`),
    }: {
        stdout?: (data: string) => void,
        stderr?: (data: string) => void,
        onError?: (data: Error) => void,
    } = {}): Promise<Server> {
        const port = await findPort();

        const serverPromise = execFile(binary, [ '--port', port.toString() ]);
        const server = serverPromise.child;
        server.stdout?.on('data', stdout);
        server.stderr?.on('data', stderr);
        server.on('error', onError);

        // `await` both the server and the health check. The health check will
        // always win the race, but if the server crashes on startup the health
        // check will never resolve and `serverPromise` will throw an error
        // instead. `await`-ing here propagates such an error to the caller of
        // `spawn()` rather than triggering an uncaught rejection.
        await Promise.race([
            untilHealthy(new URL(`http://localhost:${port}/`)),
            serverPromise,
        ]);
    
        return new Server({
            host: 'localhost',
            port,
            kill: async () => {
                // Send the kill signal.
                const signal: Signal = 'SIGINT';
                await killServer(server.pid, signal);

                // Wait for the devserver to die.
                try {
                    await serverPromise;
                } catch (err) {
                    // Dying will throw an error with no exit code, make sure
                    // the signal matches instead.
                    if (err.signal !== signal) {
                        fail(`Devserver did not die gracefully:\n${
                                err}\n\nSTDERR:\n${err.stderr}`);
                    }
                }
            },
        });
    }
}

/** Finds an unused port number and returns it. */
async function findPort(): Promise<number> {
    const server = net.createServer();

    // Listening on port 0 tells the OS to pick a free port.
    server.listen(0);

    // Get the port assigned by the OS and close the server.
    const address = server.address();
    if (!address || typeof address === 'string') {
        server.close();
        throw new Error('Failed to find a port.');
    }
    await new Promise((resolve) => {
        server.close(() => {
            resolve();
        });
    });

    // Return the port which is known to currently not have a server on it.
    // Technically something else could grab the port before the caller of this
    // function binds to it, but that is unlikely in the context of a Bazel test
    // where not much else is expected to be running.
    return address.port;
}

/** Resolves once the provided URL is ready to receive requests. */
async function untilHealthy(url: URL): Promise<void> {
    while (true) {
        const healthy = await ping(url);
        if (healthy) return;
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
}

/** Pings the given URL to verify if it is hosted a running web server. */
async function ping(url: URL): Promise<boolean> {
    try {
        const res = await http.get(url);
        return res?.statusCode === StatusCodes.OK;
    } catch (err) {
        return false;
    }
}

/**
 * Kills the given process ID (and all its children) with the provided signal.
 */
async function killServer(pid: number, signal: Signal): Promise<void> {
    await new Promise((resolve, reject) => {
        killTree(pid, signal, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}
