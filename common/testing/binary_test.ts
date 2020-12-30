import 'jasmine';

import { promises as fs } from 'fs';
import { env } from 'process';
import { execBinary } from 'rules_prerender/common/testing/binary';

const testTmpDir = env['TEST_TMPDIR'];
if (!testTmpDir) throw new Error('$TEST_TMPDIR not set.');

describe('binary', () => {
    let tmpDir: string;
    beforeEach(async () => {
        tmpDir = await fs.mkdtemp(`${testTmpDir}/binary_test-`);
    });

    afterEach(async () => {
        await fs.rmdir(tmpDir, { recursive: true });
    });

    describe('execBinary()', () => {
        it('executes the binary and propagates its results', async () => {
            await fs.writeFile(`${tmpDir}/foo.sh`, `
echo "stdout data: \${1}"
echo "stderr data: \${2}" >&2
exit 0
            `.trim());
            await fs.chmod(`${tmpDir}/foo.sh`, 0o777);

            const { code, stdout, stderr } =
                    await execBinary(`${tmpDir}/foo.sh`, [ 'foo', 'bar' ]);
            
            expect(code).toBe(0);
            expect(stdout).toBe('stdout data: foo\n');
            expect(stderr).toBe('stderr data: bar\n');
        });

        it('executes the binary and propagates its results on non-zero exit code', async () => {
            await fs.writeFile(`${tmpDir}/foo.sh`, `
echo "stdout data: \${1}"
echo "stderr data: \${2}" >&2
exit 1
            `.trim());
            await fs.chmod(`${tmpDir}/foo.sh`, 0o777);

            const { code, stdout, stderr } =
                    await execBinary(`${tmpDir}/foo.sh`, [ 'foo', 'bar' ]);
            
            expect(code).toBe(1);
            expect(stdout).toBe('stdout data: foo\n');
            expect(stderr).toBe('stderr data: bar\n');
        });
    });
});
