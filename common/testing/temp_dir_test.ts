import 'jasmine';

import { env } from 'process';
import { useTempDir } from 'rules_prerender/common/testing/temp_dir';
import { EffectTester } from 'rules_prerender/common/testing/effect_tester';

const originalTempDir = env['TEST_TMPDIR'];
describe('temp_dir', () => {
    beforeEach(() => {
        delete env['TEST_TMPDIR'];
    });

    afterEach(() => {
        env['TEST_TMPDIR'] = originalTempDir;
    });

    describe('useTempDir()', () => {
        it('provides a temporary directory as an effect', async () => {
            env['TEST_TMPDIR'] = 'test-tmpDir';

            const mkdtemp = jasmine.createSpy('mkdtemp')
                .and.resolveTo('test-tmpDir/useTempDir-foo');
            const rmdir = jasmine.createSpy('rmdir').and.resolveTo();

            const tester = EffectTester.of(() => useTempDir({
                testonly: {
                    mkdtemp,
                    rmdir,
                },
            }));

            expect(mkdtemp).not.toHaveBeenCalled();
            await tester.initialize();
            expect(mkdtemp).toHaveBeenCalledOnceWith('test-tmpDir/useTempDir-');
            
            expect(tester.get()).toBe('test-tmpDir/useTempDir-foo');

            expect(rmdir).not.toHaveBeenCalled();
            await tester.cleanup();
            expect(rmdir).toHaveBeenCalledOnceWith(
                'test-tmpDir/useTempDir-foo', { recursive: true });
        });
    });
});
