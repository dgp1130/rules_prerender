import { PrerenderResource } from 'rules_prerender';

/** Generates a single resource. */
export default function*(): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.of(`/foo.txt`, `I'm a single resource!`);
}
