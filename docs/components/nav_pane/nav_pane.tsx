import { polyfillDeclarativeShadowDom } from '@rules_prerender/declarative_shadow_dom/preact.mjs';
import { Template, inlineStyle, includeScript } from '@rules_prerender/preact';
import { VNode } from 'preact';
import { Route } from '../../route.mjs';

/** Renders a navigation pane with the given routes. */
export function NavPane({ routes }: { routes: readonly Route[] }): VNode {
    return <rp-nav-pane>
        <Template shadowrootmode="open">
            <nav>
                <RouteList routes={routes} />
            </nav>

            {polyfillDeclarativeShadowDom()}
            {includeScript('./nav_pane_script.mjs', import.meta)}
            {inlineStyle('./nav_pane.css', import.meta)}
        </Template>
    </rp-nav-pane>;
}

declare module 'preact' {
    namespace JSX {
        interface IntrinsicElements {
            'rp-nav-pane': JSX.HTMLAttributes<HTMLElement>;
        }
    }
}

/** Recursively renders all the given routes to nested lists. */
function RouteList({ routes, depth = 0 }: {
    routes: readonly Route[],
    depth?: number,
}): VNode {
    if (routes.length === 0) {
        throw new Error('Must provide at least one route to render.');
    }

    return <ul>
        {routes.map(({ label, content }) => {
            const hasSublist = typeof content !== 'string';
            const depthClass = `depth-${depth}`;
            return <li class={hasSublist ? 'sublist' : undefined}>
                {hasSublist
                    ? <>
                        {/* Expands and collapses the associated sublist. */}
                        <button data-list-toggle
                            class={`list-el ${depthClass}`}>
                            {label}
                        </button>
                        <RouteList routes={content} depth={depth + 1} />
                    </>
                    : <a href={content} class={`list-el ${depthClass}`}>
                        {label}
                    </a>
                }
            </li>;
        })}
    </ul>;
}
