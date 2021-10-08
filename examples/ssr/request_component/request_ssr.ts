import type { Request } from 'express';
import { ExpressComponent, registerExpressComponent } from 'rules_prerender/packages/express/express';

class RequestSsrComponent implements ExpressComponent {
    public render(req: Request): string {
        const name = req.query.name;
        if (!name) {
            return `<li>The \`?name\` query parameter is unset</li>`;
        } else {
            return `<li>The \`?name\` query parameter is "${name}"</li>`;
        }
    }
}

registerExpressComponent('request', () => new RequestSsrComponent());
