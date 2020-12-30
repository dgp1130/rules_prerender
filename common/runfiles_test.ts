import 'jasmine';

import { env } from 'process';
import { resolveRunfile } from './runfiles';

describe('runfiles', () => {
    beforeEach(() => {
        delete env['RUNFILES'];
    });

    describe('resolveRunfile()', () => {
        it('resolves the given runfile', async () => {
            env['RUNFILES'] = 'foo/bar/baz.runfiles';

            const resolved = resolveRunfile('wksp/hello/world.txt');

            expect(resolved).toBe('foo/bar/baz.runfiles/wksp/hello/world.txt');
        });

        it('throws an error when the $RUNFILES environment variable is not set', () => {
            delete env['RUNFILES'];

            expect(() => resolveRunfile('wksp/hello/world.txt'))
                    .toThrowError('$RUNFILES not set.');
        });
    });
});
