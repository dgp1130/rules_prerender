import { promises as fs } from 'fs';
import { execBinary } from './binary';
import { useTempDir } from './temp_dir';

describe('binary', () => {
    const tmpDir = useTempDir();

    describe('execBinary()', () => {
        it('executes the binary and propagates its results', async () => {
            await fs.writeFile(`${tmpDir.get()}/foo.sh`, `
echo "stdout data: \${1}"
echo "stderr data: \${2}" >&2
exit 0
            `.trim());
            await fs.chmod(`${tmpDir.get()}/foo.sh`, 0o777);

            const { code, stdout, stderr } = await execBinary(
                `${tmpDir.get()}/foo.sh`, [ 'foo', 'bar' ]);
            
            expect(code).toBe(0);
            expect(stdout).toBe('stdout data: foo\n');
            expect(stderr).toBe('stderr data: bar\n');
        });

        it('executes the binary and propagates its results on non-zero exit code', async () => {
            await fs.writeFile(`${tmpDir.get()}/foo.sh`, `
echo "stdout data: \${1}"
echo "stderr data: \${2}" >&2
exit 1
            `.trim());
            await fs.chmod(`${tmpDir.get()}/foo.sh`, 0o777);

            const { code, stdout, stderr } = await execBinary(
                `${tmpDir.get()}/foo.sh`, [ 'foo', 'bar' ]);
            
            expect(code).toBe(1);
            expect(stdout).toBe('stdout data: foo\n');
            expect(stderr).toBe('stderr data: bar\n');
        });
    });
});
