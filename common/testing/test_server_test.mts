import { TestServer } from './test_server.mjs';

describe('test_server', () => {
    describe('TestServer', () => {
        // Placeholder test, not very useful on its own, but sets up the
        // infrastructure to add more tests when relevant. This can probably be
        // dropped when more meaningful tests are added.
        it('implements its interface', () => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const server: TestServer = {
                host: '127.0.0.1',
                port: 1234,
                basePath: '/foo/',
            };

            // Test only needs to compile, nothing to do here.
            expect().nothing();
        });
    });
});
