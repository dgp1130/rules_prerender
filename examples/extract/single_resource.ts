import { PrerenderResource } from 'rules_prerender';

/** Generates a single resource. */
export default function*(): Iterable<PrerenderResource> {
    yield PrerenderResource.of(`/foo.txt`, `I'm a single resource!`);
}
