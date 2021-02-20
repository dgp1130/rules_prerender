import { PrerenderResource } from 'rules_prerender';

/** Generates a single, nested resource. */
export default function*(): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.of(`/foo/bar/baz.txt`, `I'm a nested resource!`);
}
