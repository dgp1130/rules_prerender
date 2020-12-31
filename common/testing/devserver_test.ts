import 'jasmine';

import { StatusCodes } from 'http-status-codes';
import { URL } from 'url';
import * as http from 'rules_prerender/common/http';
import { resolveRunfile } from 'rules_prerender/common/runfiles';
import { Server, useDevserver } from 'rules_prerender/common/testing/devserver';
import { EffectTester } from 'rules_prerender/common/testing/effect_tester';

const devserver = resolveRunfile(
        'rules_prerender/common/testing/devserver_test_server');

describe('devserver', () => {
    describe('Server', () => {
        describe('spawn()', () => {
            it('spawns a devserver process for the given binary', async () => {
                const server = await Server.spawn(devserver);

                expect(server.host).toBe('localhost');
                expect(typeof server.port).toBe('number');
                expect(server.port).not.toBeNaN();

                const res = await http.get(new URL(
                    `http://localhost:${server.port}/devserver_test_page.html`,
                ));
                expect(res.statusCode).toBe(StatusCodes.OK);

                await server.kill();
            });

            it('rejects on sever startup error', async () => {
                await expectAsync(Server.spawn('does/not/exist'))
                        .toBeRejected();
            });
        });

        describe('kill()', () => {
            it('kills the devserver process', async () => {
                const server = await Server.spawn(devserver);

                const res = await http.get(new URL(
                    `http://localhost:${server.port}/devserver_test_page.html`,
                ));
                expect(res.statusCode).toBe(StatusCodes.OK);

                await server.kill();

                await expectAsync(
                    http.get(new URL(
                        `http://localhost:${server.port}/devserver_test_page.html`,
                    )),
                ).toBeRejected();
            });
        });
    });

    describe('useDevserver()', () => {
        it('provides a `Server` effect', async () => {
            const mockServer = {
                host: 'localhost',
                kill: jasmine.createSpy('kill'),
            };
            spyOn(Server, 'spawn')
                    .and.resolveTo(mockServer as unknown as Server);

            const tester = EffectTester.of(() => useDevserver('path/to/bin'));
            expect(Server.spawn).not.toHaveBeenCalled();

            // Initialize spawns the server and does not clean it up yet.
            await tester.initialize();
            expect(Server.spawn).toHaveBeenCalledOnceWith('path/to/bin');
            expect(mockServer.kill).not.toHaveBeenCalled();

            // Server is now available.
            expect(tester.get().host).toBe('localhost');

            // Cleanup kills the server.
            await tester.cleanup();
            expect(mockServer.kill).toHaveBeenCalledOnceWith();
        });
    });
});
