import 'jasmine';

import { TestServer } from './test_server';

describe('test_server', () => {
    describe('TestServer', () => {
        // Placeholder test, not very useful on its own, but sets up the
        // infrastructure to add more tests when relevant. This can probably be
        // drop when more meaningful tests are added.
        it('implements its interface', () => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const server: TestServer = {
                host: 'localhost',
                port: 1234,
                basePath: '/foo/',
            };

            // Test only needs to compile, nothing to do here.
            expect().nothing();
        });
    });
});
