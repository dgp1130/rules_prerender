import { URL } from 'url';
import { StatusCodes } from 'http-status-codes';
import * as http from '../http.mjs';
import { Server, useDevserver } from './devserver.mjs';
import { EffectTester } from './effect_tester.mjs';

const devserver = 'common/testing/devserver_test_server.sh';

describe('devserver', () => {
    describe('Server', () => {
        describe('spawn()', () => {
            it('spawns a devserver process for the given binary', async () => {
                const server = await Server.spawn(devserver);

                expect(server.host).toBe('127.0.0.1');
                expect(typeof server.port).toBe('number');
                expect(server.port).not.toBeNaN();

                const res = await http.get(new URL(
                    `http://${server.host}:${server.port}/devserver_test_page.html`,
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
                    `http://${server.host}:${server.port}/devserver_test_page.html`,
                ));
                expect(res.statusCode).toBe(StatusCodes.OK);

                await server.kill();

                await expectAsync(
                    http.get(new URL(
                        `http://${server.host}:${server.port}/devserver_test_page.html`,
                    )),
                ).toBeRejected();
            });
        });
    });

    describe('useDevserver()', () => {
        it('provides a `Server` effect', async () => {
            const kill = jasmine.createSpy('kill');
            const mockServer = {
                host: '127.0.0.1',
                kill,
            };
            const spawnSpy = spyOn(Server, 'spawn')
                .and.resolveTo(mockServer as unknown as Server);

            const tester = EffectTester.of(() => useDevserver('path/to/bin'));
            expect(spawnSpy).not.toHaveBeenCalled();

            // Initialize spawns the server and does not clean it up yet.
            await tester.initialize();
            expect(spawnSpy).toHaveBeenCalledOnceWith('path/to/bin');
            expect(kill).not.toHaveBeenCalled();

            // Server is now available.
            expect(tester.get().host).toBe('127.0.0.1');

            // Cleanup kills the server.
            await tester.cleanup();
            expect(kill).toHaveBeenCalledOnceWith();
        });
    });
});
