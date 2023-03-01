import { PrerenderResource } from 'rules_prerender';

/** Generates some resources of any file type. No HTML files here! */
export default function* (): Generator<PrerenderResource, void, void> {
    // Can prerender text files.
    yield PrerenderResource.of('/hello.txt', 'Hello, World!');
    yield PrerenderResource.of('/goodbye.txt', 'Goodbye, World!');

    // Can prerender binary files.
    yield PrerenderResource.of('/data.bin', new Uint8Array([ 0, 1, 2, 3 ]));
}
