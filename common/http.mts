import http from 'http';
import { URL } from 'url';

/**
 * Promisified wrapper of `http.get()`.
 * 
 * @param url The {@link URL} to make an HTTP GET request to.
 * @return A {@link Promise} which resolves with the HTTP response of the GET
 *     request. May reject if an HTTP response could not be retrieved (such as
 *     for a refused connection).
 */
export async function get(url: URL): Promise<http.IncomingMessage> {
    return await new Promise<http.IncomingMessage>((resolve, reject) => {
        const req = http.get(url, (res) => {
            resolve(res);
        });
        req.on('error', (err) => {
            // Connection refused.
            reject(err);
        });
    });
}
