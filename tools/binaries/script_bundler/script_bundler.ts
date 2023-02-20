import { execFile as execFileCb } from 'child_process';
import { promises as fs } from 'fs';
import { promisify } from 'util';
import { main } from '../../../common/binary';

const execFile = promisify(execFileCb);

const rollup = `${process.env['RUNFILES']}/rules_prerender/tools/binaries/script_bundler/rollup.sh`;

main(async () => {
    const args = process.argv.slice(2);
    const [ manifest, ...rollupArgs ] = args as [ string, ...string[] ];

    const manifestContent = await fs.readFile(manifest, 'utf8');
    const entryPoints = manifestContent.trim().split('\n');

    const flaggedEntryPoints = entryPoints.flatMap((entryPoint) => ['-i', entryPoint]);
    const subProcessArgs = [ ...rollupArgs, ...flaggedEntryPoints];
    console.error(`Running subcommand:\n$ rollup ${
        subProcessArgs
            .map((arg) => arg.includes(' ') ? `"${arg}"` : arg)
            .join(' ')
    }`);

    const proc = execFile(rollup, subProcessArgs);
    proc.child.stdout?.on('data', console.log.bind(console));
    proc.child.stderr?.on('data', console.error.bind(console));

    await new Promise<void>((resolve, reject) => {
        proc.child.on('exit', () => { resolve(); });
        proc.child.on('error', (err) => { reject(err); });
    });

    return proc.child.exitCode ?? 0;
});
