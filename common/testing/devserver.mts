import { execFile as execFileCb, ChildProcess, ExecException } from 'child_process';
import { StatusCodes } from 'http-status-codes';
import killTree from 'tree-kill';
import net from 'net';
import { URL } from 'url';
import { promisify } from 'util';
import * as http from '../http.mjs';
import { Effect, useForAll } from './effects.mjs';
import { TestServer } from './test_server.mjs';

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
 *     // Handles initialization and cleanup automatically.
 *     const server = useDevserver('path/to/devserver/binary');
 *
 *     it('is alive', async () => {
 *         const res = await fetch(
 *             `http://${server.get().host}:${server.get().port}/`);
 *         expect(res.status).toBe(200);
 *     });
 * });
 * ```
 *
 * @param args Arguments to pass through to {@link Server.spawn}. See
 *     documentation there.
 * @return A proxied {@link Server} instance usable for tests.
 */
export function useDevserver(...args: Parameters<typeof Server.spawn>):
        Effect<DevServer> {
    return useForAll(async () => {
        const server = await Server.spawn(...args);

        return [
            server,
            async () => {
                await server.kill();
            },
        ] as const;
    });
}

/** A simpler extension of `TestServer` which includes a `url`. */
export interface DevServer extends TestServer {
    /** A full URL of the devserver. */
    readonly url: string;
}

/** A running devserver instance. */
export class Server implements DevServer {
    /** The host the server is running on (typically '127.0.0.1'). */
    public readonly host: string;
    /** The port the server is running on. */
    public readonly port: number;
    /** The base path of the server. */
    public readonly basePath: `/${string}` = '/';
    /** Kills the child process executing the devserver. */
    public readonly kill: () => Promise<void>;

    /**
     * Constructs a new DevServer representing an already running
     * `web_resources_devserver()` child process.
     *
     * @param host The host the devserver is running on (typically '127.0.0.1').
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

    /** The full URL of the base path of the server. */
    public get url(): string {
        return `http://${this.host}:${this.port}${this.basePath}`;
    }

    /**
     * Spawns a new instance of a Server with the given binary path.
     *
     * @param binary Path to a `js_binary()` executable to invoke which will
     *     start the server. This is usually done via a `data` dependency on a
     *     `web_resources_devserver()`. The path to a
     *     `web_resources_devserver()` target can be retrieved by resolving a
     *     runfile at
     *     `${workspaceName}/${pathToDevserverPkg}/${devserverName}.sh`. For
     *     example, a `web_resources_devserver(name = "my_server")` target in
     *     `path/to/pkg/BUILD` with a `workspace(name = "wksp")` in the root
     *     `WORKSPACE` file would have its binary at
     *     `process.env.RUNFILES + '/wksp/path/to/pkg/my_server'` (don't forget
     *     the `data` dependency on `//path/to/pkg:my_server`!).
     * @param stdout A function to call when receiving data from stdout of the
     *     server.
     * @param stderr A function to call when receiving data from stderr of the
     *     server.
     * @param onError A function to call when receiving an error from the
     *     server.
     */
    public static async spawn(binary: string, {
        stdout = (data) => {
            console.error(prependLine('[devserver - stdout] ', data));
        },
        stderr = (data) => {
            console.error(prependLine('[devserver - stderr] ', data));
        },
        onError = (data) => {
            console.error(prependLine('[devserver - onError] ', data.message));
        },
    }: {
        stdout?: (data: string) => void,
        stderr?: (data: string) => void,
        onError?: (data: Error) => void,
    } = {}): Promise<Server> {
        // We can't use `localhost` as the host in Node 18+ and need to use the
        // IP address directly. See https://github.com/nodejs/node/issues/40702.
        const host = '127.0.0.1';
        const port = await findPort();

        const serverPromise = execFile(binary, [ `--port=${port.toString()}` ]);
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
            untilHealthy(new URL(`http://${host}:${port}/`)),
            serverPromise,
        ]);

        return new Server({
            host,
            port,
            kill: async () => {
                // Send the kill signal.
                const signal: Signal = 'SIGINT';
                await killServer(server.pid, signal);

                // Wait for the devserver to die.
                try {
                    await serverPromise;
                } catch (error) {
                    // Dying will throw an error with no exit code, make sure
                    // the signal matches instead.
                    const err = error as ExecException & { stderr: string };
                    if (err.signal && err.signal !== signal) {
                        fail('Devserver did not die gracefully. Died with'
                            + ` ${err.signal}, expected signal ${signal}:\n${
                                err.message}\n\nSTDERR:\n${err.stderr}`);
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
    await new Promise<void>((resolve) => {
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
        return res.statusCode === StatusCodes.OK;
    } catch (err) {
        return false;
    }
}

/**
 * Kills the given process ID (and all its children) with the provided signal.
 */
async function killServer(pid: number, signal: Signal): Promise<void> {
    await new Promise<void>((resolve, reject) => {
        killTree(pid, signal, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

function prependLine(prefix: string, content: string): string {
    return content.split('\n')
        .map((line) => `${prefix}${line}`)
        .join('\n');
}
