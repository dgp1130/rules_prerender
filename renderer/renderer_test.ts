import 'jasmine';

import { execFile as execFileCb } from 'child_process';
import { env } from 'process';
import { promisify } from 'util';

const execFile = promisify(execFileCb);

const runfiles = env['RUNFILES'];
if (!runfiles) throw new Error('$RUNFILES not set.');

const renderer = `${runfiles}/rules_prerender/renderer/renderer.sh`;

/** Invokes the renderer binary. */
async function run({ entryPoint }: { entryPoint: string }):
        Promise<{ stdout: string, stderr: string }> {
    return await execFile(renderer, [
        '--entry-point', entryPoint,
    ]);
}

describe('renderer', () => {
    it('prints hello', async () => {
        const { stdout, stderr } = await run({
            entryPoint: 'foo.js',
        });

        expect(stdout.trim()).toBe('--entry-point=foo.js');
        expect(stderr.trim()).toBe('');
    });
});
