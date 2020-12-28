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

async function run({ inputHtml, outputHtml, outputAnnotations }: {
    inputHtml: string,
    outputHtml: string,
    outputAnnotations: string,
}): Promise<ProcessResult> {
    try {
        const { stdout, stderr } = await execFile(extractor, [
            '--input-html', inputHtml,
            '--output-html', outputHtml,
            '--output-annotations', outputAnnotations,
        ]);
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
    it('prints flags', async () => {
        const { code, stdout, stderr } = await run({
            inputHtml: 'input.html',
            outputHtml: 'output.html',
            outputAnnotations: 'annotations.json',
        });

        expect(code).toBe(0);
        expect(stderr.trim()).toBe('');
        expect(stdout.trim()).toContain('--input-html=input.html');
        expect(stdout.trim()).toContain('--output-html=output.html');
        expect(stdout.trim())
                .toContain('--output-annotations=annotations.json');
    });
});
