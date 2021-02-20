import { PrerenderResource } from 'rules_prerender';

/** Generates a single, nested resource. */
export default function*(): Iterable<PrerenderResource> {
    yield PrerenderResource.of(`/foo/bar/baz.txt`, `I'm a nested resource!`);
}
