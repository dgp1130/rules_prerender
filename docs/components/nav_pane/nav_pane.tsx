import { Template } from '@rules_prerender/declarative_shadow_dom/preact.mjs';
import { CustomElement, inlineStyle, includeScript } from '@rules_prerender/preact';
import { VNode } from 'preact';
import { JSX } from 'preact/jsx-runtime';
import { type Route } from '../../routing.mjs';
import { testId } from '../../test_id.mjs';

/** Renders a navigation pane with the given routes. */
export function NavPane({ currentRoute, routes, ...attrs }: {
    currentRoute: Route,
    routes: Route[],
} & JSX.IntrinsicElements['rp-nav-pane']): VNode {
    if (routes.length === 0) {
        throw new Error('Must provide at least one route to render.');
    }

    return <rp-nav-pane {...attrs} role="navigation">
        <Template shadowrootmode="open">
            <RouteList
                currentRoute={currentRoute}
                routes={routes}
                test-id={testId('root')}
            />

            {includeScript('./nav_pane_script.mjs', import.meta)}
            {inlineStyle('./nav_pane.css', import.meta)}
        </Template>
    </rp-nav-pane>;
}

declare module 'preact' {
    namespace JSX {
        interface IntrinsicElements {
            'rp-nav-pane': JSX.HTMLAttributes<CustomElement>;
        }
    }
}

/** Recursively renders all the given routes to nested lists. */
function RouteList({ currentRoute, routes, depth = 0, ...attrs }: {
    currentRoute: Route,
    routes: Route[],
    depth?: number,
} & JSX.IntrinsicElements['ul']): VNode {
    return <ul {...attrs}>
        {routes
            .map((route) => {
                const hasChildren = !!route.children.length;
                const isAncestorOfCurrentRoute =
                    routeIsAncestorOf(route, currentRoute);
                const isCurrentRoute = route === currentRoute;
                const depthClass = `depth-${depth}`;

                return <li class={classes({
                    sublist: hasChildren,
                    expanded: isAncestorOfCurrentRoute,
                    ['current-page']: isCurrentRoute,
                })}>
                    {hasChildren
                        ? <>
                            {/* Expands and collapses the associated sublist. */}
                            <button data-list-toggle
                                class={`list-el ${depthClass}`}>
                                {route.label}
                            </button>
                            <RouteList
                                currentRoute={currentRoute}
                                routes={route.children}
                                depth={depth + 1}
                            />
                        </>
                        : <a href={route.path} class={`list-el ${depthClass}`}>
                            {route.label}
                        </a>
                    }
                </li>;
            })
        }
    </ul>;
}

/**
 * Whether or not a route is an ancestor (transitive parent) of another route.
 */
function routeIsAncestorOf(maybeAncestor: Route, route: Route): boolean {
    if (route.parent === maybeAncestor) return true;
    if (route.parent) return routeIsAncestorOf(route.parent, maybeAncestor);
    return false;
}

/**
 * Returns a `class` string for every class in the input record which is mapped
 * to `true`. `false` classes are discarded.
 *
 * Example:
 *
 * ```typescript
 * function MyComponent({ isFoo, isBar }: { isFoo: boolean, isBar: boolean }):
 *         VNode {
 *     return <div class={classes({
 *       foo: isFoo,
 *       bar: isBar,
 *     })} />;
 * }
 *
 * (<MyComponent isFoo={true} isBar={false} />);
 * // <div class="foo"></div>
 * ```
 */
function classes(classBag: Record<string, boolean>): string | undefined {
    const classList = Object.entries(classBag)
        .filter(([_name, enabled]) => enabled)
        .map(([name]) => name);

    if (classList.length === 0) {
        // Optimization: If we set `<div class="" />` in TSX, it will render
        // `<div class></div>` in the output, which is just wasted bytes.
        // `<div class={undefined} />` drop this pointless attribute.
        return undefined;
    }

    return classList.join(' ');
}
