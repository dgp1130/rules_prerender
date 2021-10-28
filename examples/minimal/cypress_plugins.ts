import { runfiles } from '@bazel/runfiles';
import { Server } from '../../common/testing/devserver';

const devserverBinary = runfiles.resolvePackageRelative('devserver');

export default async function (
    on: (event: string, callback: () => void | Promise<void>) => void,
    config: Record<string, unknown>,
): Promise<Record<string, unknown>> {
    const { host, port, kill } = await Server.spawn(devserverBinary, {
        port: 3000,
    });
    
    on('after:spec', async () => {
        await kill();
    });

    return {
        ...config,
        baseUrl: `http://${host}:${port}`,
    };
}
