import * as path from 'path';
import { Request, Response, NextFunction } from 'express';
import { render } from 'rules_prerender/packages/ssr/ssr';

export function ssr(webRoot: string): Middleware {
    return asyncMiddleware(async (req, res) => {
        // Validate the requested path.
        const reqPath = path.normalize(req.path);
        if (req.path.startsWith('..')) {
            throw new Error(`Requesting a path outside of the web root: ${req.path}`);
        }
        const filePath = path.join(webRoot, reqPath);

        // Render the file at that path and write it to the response.
        for await (const chunk of render(filePath)) {
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
