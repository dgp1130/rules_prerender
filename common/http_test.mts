import nodeHttp from 'http';
import { URL } from 'url';
import * as http from './http.mjs';

describe('http', () => {
    describe('get', () => {
        it('resolves with the HTTP response from a GET request to the given URL', async () => {
            const mockReq = {
                on: jasmine.createSpy('on'),
            } as unknown as nodeHttp.ClientRequest;
            const mockRes = {} as nodeHttp.IncomingMessage;
            spyOn(nodeHttp, 'get').and.callFake(
                ((url: URL, cb: (res: nodeHttp.IncomingMessage) => void):
                        nodeHttp.ClientRequest => {
                    cb(mockRes);
                    return mockReq;
                }) as any,
            );

            const res = await http.get(new URL('http://127.0.0.1/foo'));

            expect(nodeHttp.get).toHaveBeenCalledOnceWith(
                new URL('http://127.0.0.1/foo'),
                jasmine.any(Function),
            );

            expect(res).toBe(mockRes);
        });

        it('rejects with an error when a GET request to the given URL fails', async () => {
            let onError: (data: unknown) => void;
            const mockReq = {
                on: jasmine.createSpy('on').and.callFake(
                    (event: string, callback: (data: unknown) => void) => {
                        expect(event).toBe('error');
                        onError = callback;
                    },
                ),
            } as unknown as nodeHttp.ClientRequest;
            spyOn(nodeHttp, 'get').and.callFake(
                (() => mockReq) as any,
            );

            const error = new Error('Network issue.');
            const promise = http.get(new URL('http://127.0.0.1/foo'));
            onError!(error);

            await expectAsync(promise).toBeRejectedWith(error);
        });
    });
});
