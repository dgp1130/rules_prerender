import * as path from 'path';
import { Request, Response, NextFunction } from 'express';
import { SsrComponent, SsrFactory, registerComponent, render } from 'rules_prerender/packages/ssr/ssr';
import { JsonObject } from 'rules_prerender/common/models/json';

type ExpressSsrParams = [ Request ];
export type ExpressComponent = SsrComponent<ExpressSsrParams>;

export function registerExpressComponent<
    PrerenderData extends JsonObject | undefined
>(component: string, factory: SsrFactory<PrerenderData, [ Request ]>): void {
    registerComponent(component, factory);
}

export function ssr(webRoot: string): Middleware {
    return asyncMiddleware(async (req, res) => {
        // Validate the requested path.
        const reqPath = path.normalize(req.path);
        if (req.path.startsWith('..')) {
            throw new Error(`Requesting a path outside of the web root: ${req.path}`);
        }
        const filePath = path.join(webRoot, reqPath);

        // Render the file at that path and write it to the response.
        const ssrParams: ExpressSsrParams = [ req ];
        for await (const chunk of render(filePath, ssrParams)) {
            res.write(chunk);
        }
        res.end();
    });
}

type Middleware = (req: Request, res: Response, next: NextFunction) => void;
function asyncMiddleware(
    middleware: (req: Request, res: Response) => Promise<void>,
): Middleware {
    return async (req, res, next) => {
        try {
            await middleware(req, res);
            next();
        } catch (err) {
            next(err);
        }
    };
}
