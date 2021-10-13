import { Request } from 'express';
import { ExpressComponent, ExpressContext, registerExpressComponent } from 'rules_prerender/packages/express/express';

const knownRequests = new WeakSet<Request>();
let requestCount = 0;

export class MixedSsrComponent implements ExpressComponent {
    public readonly name = 'mixed';

    public render({ req }: ExpressContext): string {
        // Count the request if this component has never seen it before. This
        // counts any request which renders this component. Saving known
        // requests prevents double-counting if a single page uses this
        // component twice. Does not count pages which don't include this
        // component.
        if (!knownRequests.has(req)) {
            requestCount++;
            knownRequests.add(req);
        }

        return `<li>SSR: This was request #${requestCount}.</li>`;
    }
}

registerExpressComponent('mixed', () => new MixedSsrComponent());

declare global {
    interface SsrComponentMap {
        'mixed': [ undefined, MixedSsrComponent ];
    }
}
