import * as path from 'path';
import { PrerenderResource, SafeHtml } from 'rules_prerender';
import { parallel } from './common/iterables.mjs';

/**
 * Hierarchical routes expressed as a doubly-linked tree which describes how
 * routes relate to each other.
 *
 * This is similar to {@link RouteConfig} however some properties are removed to
 * reduce scope and avoid leaking unrelated implementation details.
 */
export interface Route {
    /** Text to display to the user identifying this route. */
    readonly label: string;

    /** The URL path to this page relative to the parent route. */
    readonly path: string;

    /** Child routes to be included under this route in navigation. */
    readonly children: Route[],

    /** The direct parent route containing this route. */
    readonly parent?: Route,
}

/**
 * Hierarchical route configuration expressed as a doubly-linked tree which
 * describes how routes relate to each other and how each one is rendered.
 *
 * Leaf routes (those with no children) *must* define a `render` function.
 *
 * Child paths are joined with parent paths when rendering the route. For
 * example:
 *
 * ```typescript
 * const routes: RouteConfig[] = [
 *     {
 *         path: 'parent',
 *         children: [
 *             {
 *                 path: 'child/',
 *                 render: () => { ... },
 *             },
 *         ],
 *     },
 * ];
 * ```
 *
 * This will render exactly one page at `/parent/child/index.html`. Parent
 * routes *can* be rendered with their own `render` function but do not need to
 * be.
 *
 * Parent route paths do not need any leading or trailing slashes. However, leaf
 * route paths *must* end in either `/` or `.html`. Paths ending in `.html` are
 * rendered at exactly that location. Paths ending in `/` are rendered at
 * `.../index.html` in that directory. For a path like `/parent/child`, this
 * distinction matters because it can either render `/parent/child.html` or
 * `/parent/child/index.html` depending on the suffix used. When the page looks
 * up a resource such as `./foo.jpg` the former will resolve to
 * `/parent/foo.jpg` while the latter will use `/parent/child/foo.jpg`.
 */
export type RouteConfig = Omit<Omit<Route, 'parent'>, 'children'> & {
    /** Child routes to be included under this route in navigation. */
    readonly children?: RouteConfig[];

    /**
     * A function to render this route as an HTML page.
     *
     * @param currentRoute The {@link Route} object representing this
     *     {@link RouteConfig} being rendered.
     * @param routes The root route list as an array of {@link Route} objects.
     * @returns The rendered page.
     */
    readonly render?: (currentRoute: Route, routes: Route[]) =>
        SafeHtml | Promise<SafeHtml>;

    /**
     * Whether or not the route should be hidden from the displayed DOM. The
     * page will still be rendered and accessible at its URL but will not appear
     * in the {@link Route} array given to the `render` function.
     */
    readonly hiddenChild?: boolean;
}

/**
 * Links a {@link RouteConfig} with its associated {@link Route} object in a
 * tree.
 */
interface LinkedRoute {
    children: LinkedRoute[];
    config: RouteConfig;
    route: Route;
}

/**
 * Bootstraps the `@rules_prerender` rendering process with the router.
 *
 * ```typescript
 * export default bootstrap([
 *   // Routes...
 * ]);
 * ```
 *
 * @param routeConfig The hierarchy of routes to generate.
 * @returns A function which returns an {@link AsyncGenerator} which yields
 *     rendered pages for all the configured routes. Best used in an
 *     `export default` of a `prerender_pages` target.
 */
export function bootstrap(routeConfig: readonly RouteConfig[]):
        () => AsyncGenerator<PrerenderResource, void, void> {
    return () => generateRoutePages(routeConfig);
}

/**
 * Processes the given route configuration and renders each route with a defined
 * `render` function. Each rendered route is yielded at the associated path.
 *
 * @param routeConfigs The hierarchy of routes to generate.
 * @returns An {@link AsyncGenerator} which yields a {@link PrerenderResource}
 *     object for each render-able route.
 */
export async function* generateRoutePages(routeConfigs: readonly RouteConfig[]):
        AsyncGenerator<PrerenderResource, void, void> {
    assertNoLeadingSlashes(routeConfigs);

    // Process the input configuration into a `LinkedRoute[]`.
    const transformedForest = transformConfigsToRoutes(routeConfigs);
    const linkedRouteForest = linkRouteForests(routeConfigs, transformedForest);
    const routeForest = stripHiddenChildren(linkedRouteForest);

    // Assert the input configuration was sane.
    assertNoDuplicateRoutes(routeForest);
    assertLeafRoutesRenderable(routeForest);

    // Generate all routes in parallel.
    const resources = parallel(...generateRouteForest(routeForest));
    for await (const resource of resources) yield resource;
}

/** Recursively generate all routes in the given forest. */
function generateRouteForest(
    routeForest: readonly LinkedRoute[],
    inputRootForest?: Route[],
): Array<AsyncIterable<PrerenderResource>> {
    // Default to the first `routeForest` given as the root.
    const rootForest = inputRootForest
        ?? routeForest
            // Need to manually hide top-level hidden routes as they aren't
            // covered by `stripHiddenChildren`.
            .filter((linkedRoute) => !linkedRoute.config.hiddenChild)
            .map((linkedRoute) => linkedRoute.route);

    return routeForest.flatMap((linkedRoute) => {
        const gens: AsyncIterable<PrerenderResource>[] = [];

        // Render the route.
        const { render } = linkedRoute.config;
        if (render) {
            gens.push((async function* () {
                const htmlPath = inferHtmlPath(linkedRoute.route.path);
                let html: SafeHtml;
                try {
                    html = await render(linkedRoute.route, rootForest);
                } catch (err) {
                    if (err instanceof Error) {
                        err.message = `Error while rendering \`${
                            linkedRoute.route.path}\`:\n${err.message}`;
                    }

                    throw err;
                }
                yield PrerenderResource.fromHtml(htmlPath, html);
            })());
        }

        // Render all the route's children recursively.
        if (linkedRoute.children) {
            gens.push(...generateRouteForest(linkedRoute.children, rootForest));
        }

        return gens;
    });
}

function inferHtmlPath(fullPath: string): string {
    if (fullPath.endsWith('.html')) {
        return fullPath;
    } else if (fullPath.endsWith('/')) {
        return path.join(fullPath, 'index.html');
    } else {
        throw new Error(`Path \`${
            fullPath}\` must end in a \`/\` or \`.html\` extension.`);
    }
}

/**
 * Recursively takes an array of {@link RouteConfig} objects and converts each
 * one to a {@link Route} object.
 */
function transformConfigsToRoutes(
    routeConfigs: readonly RouteConfig[],
    parent?: Route,
): Route[] {
    return routeConfigs.map((routeConfig) => {
        const fullPath = path.join(parent?.path ?? '/', routeConfig.path);
        const tree = {
            label: routeConfig.label,
            path: fullPath,
            parent: parent,
            children: [] as Route[],
        };

        tree.children = routeConfig.children
            ? transformConfigsToRoutes(routeConfig.children, tree)
            : [];

        return tree;
    });
}

function linkRouteForests(
    configs: readonly RouteConfig[],
    routes: readonly Route[],
): LinkedRoute[] {
    return zip(configs, routes).map(([ config, route ]) => ({
        config,
        route,
        children: linkRouteForests(
            config.children ?? [],
            route.children ?? [],
        ),
    }));
}

/**
 * Transforms the input {@link LinkedRoute} array into a new version where
 * hidden children are removed. There are a few nuances to this function:
 *
 * 1.  Only the `route` subtree is affected, the `config` subtree is left alone.
 *     This is so we can find and render hidden routes under the `config` tree
 *     even if they aren't present in the `route` tree.
 * 2.  Top-level hidden routes remain in the output because we need the `config`
 *     tree for each to render them. These will need to be removed at a later
 *     stage.
 * 3.  Hidden children still retain valid references to their parent. These
 *     routes are only removed from the `children` property of their parents.
 *     This is because hidden routes still receive a reference to their own
 *     location when rendering themselves, and it is valid to follow that path
 *     up to the root.
 * 4.  If a hidden route contains child routes, these routes will be
 *     inaccessible from the root of the `route` subtree. However those routes
 *     can be accessed when rendering the hidden parent, since they will still
 *     be visible under the parent routes self-link unless each child is
 *     individually hidden.
 */
function stripHiddenChildren(linkedRoutes: LinkedRoute[], parent?: LinkedRoute):
        LinkedRoute[] {
    return linkedRoutes.map((linkedRoute) => {
        // Create a new `LinkedRoute` with an updated `route` subtree with
        // hidden children removed and an updated `parent` link.
        const transformedRoute = {
            ...linkedRoute,
            route: {
                ...linkedRoute.route,
                parent: parent?.route,
            },
        };

        // Recursively remove hidden children and also update the `parent` link
        // of each to point to the transformed route object.
        transformedRoute.children =
            stripHiddenChildren(linkedRoute.children, transformedRoute);

        // Each route has two paths to it:
        // 1. Through the associated `LinkedRoute`.
        // 2. Through the parent `Route`.
        // We already updated the `LinkedRoute` edge above, but we also need to
        // update the `Route` edge to maintain referential equality since we
        // have created a new `Route` object in this function.
        transformedRoute.route.children = transformedRoute.children
            .filter((route) => !route.config.hiddenChild)
            .map((linkedChild) => linkedChild.route);

        return transformedRoute;
    });
}

/** Asserts no route config has a leading slash. */
function assertNoLeadingSlashes(routeConfigs: readonly RouteConfig[]): void {
    for (const routeConfig of routeConfigs) {
        if (routeConfig.path.startsWith('/')) {
            throw new Error(`Route "${routeConfig.label}" uses path "${
                routeConfig.path}" which can not start with a slash. Did you mean "${
                routeConfig.path.slice(1)}"?`);
        }

        if (routeConfig.children) assertNoLeadingSlashes(routeConfig.children);
    }
}

/** Asserts no two input routes will generate a file at the same location. */
function assertNoDuplicateRoutes(
    linkedRoutes: readonly LinkedRoute[],
    knownRoutes: Map<string, LinkedRoute> = new Map(),
): void {
    for (const linkedRoute of linkedRoutes) {
        if (linkedRoute.config.render) {
            const htmlPath = inferHtmlPath(linkedRoute.route.path);
            const existingRoute = knownRoutes.get(htmlPath);
            if (existingRoute) {
                throw new Error(`
Multiple routes resolved to "${htmlPath}".

First claim used \`label: "${existingRoute.config.label}"\`.
Second claim used \`label: "${linkedRoute.config.label}"\`.
                `.trim());
            }

            knownRoutes.set(htmlPath, linkedRoute);
        }

        if (linkedRoute.children) {
            assertNoDuplicateRoutes(linkedRoute.children, knownRoutes);
        }
    }
}

/**
 * Asserts all leaf route can be rendered. If a leaf route could not be
 * rendered, it would serve no purpose and is clearly a bug.
 */
function assertLeafRoutesRenderable(linkedRoutes: readonly LinkedRoute[]):
        void {
    for (const { config, route, children } of linkedRoutes) {
        if (!config.render && !(config.children ?? []).length) {
            throw new Error(`Route "${route.path}" must have either \`render\` or \`children\` defined.`);
        }

        if (children) assertLeafRoutesRenderable(children);
    }
}

function zip<Left, Right>(left: readonly Left[], right: readonly Right[]):
        Array<[ Left, Right ]> {
    if (left.length !== right.length) {
        throw new Error('Cannot zip arrays of different length.');
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return left.map((l, index) => [ l, right[index]! ]);
}
