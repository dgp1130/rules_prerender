import 'jasmine';

import { execFile as execFileCb } from 'child_process';
import { env } from 'process';
import { promisify } from 'util';

const execFile = promisify(execFileCb);

const runfiles = env['RUNFILES'];
if (!runfiles) throw new Error('$RUNFILES not set.');

const extractor = `${runfiles}/rules_prerender/packages/annotation_extractor/annotation_extractor.sh`;

interface ProcessResult {
    code: number;
    stdout: string;
    stderr: string;
}

async function run(): Promise<ProcessResult> {
    try {
        const { stdout, stderr } = await execFile(extractor);
        return {
            code: 0,
            stdout,
            stderr,
        };
    } catch (err) {
        const { code, stdout, stderr } = err;
        return { code, stdout, stderr };
    }
}

describe('annotation_extractor', () => {
    it('prints hello', async () => {
        const { code, stdout, stderr } = await run();

        expect(code).toBe(0);
        expect(stdout.trim()).toBe('Hello, World!');
        expect(stderr.trim()).toBe('');
    });
});
