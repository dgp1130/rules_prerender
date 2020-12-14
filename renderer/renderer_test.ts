import 'jasmine';

import { execFile as execFileCb } from 'child_process';
import { env } from 'process';
import { promisify } from 'util';

const execFile = promisify(execFileCb);

const runfiles = env['RUNFILES'];
if (!runfiles) throw new Error('$RUNFILES not set.');

const renderer = `${runfiles}/rules_prerender/renderer/renderer.sh`;

/** Invokes the renderer binary. */
async function run(): Promise<{ stdout: string, stderr: string }> {
    return await execFile(renderer);
}

describe('renderer', () => {
    it('prints hello', async () => {
        const { stdout, stderr } = await run();

        expect(stdout.trim()).toBe('Hello, World!');
        expect(stderr.trim()).toBe('');
    });
});
