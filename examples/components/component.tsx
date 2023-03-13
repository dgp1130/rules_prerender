import { VNode } from 'preact';
import { tsDep } from './ts_dep.mjs';
import { Dep } from './dep.js';

/** Prerenders this component using other components. */
export function Component(): VNode {
    return <div class="component">
        <span class="content">I'm a component!</span>

        {/* Can use basic \`ts_project()\` dependencies. */}
        <span class="ts-dep">{tsDep()}</span>

        {/* Can compose other \`prerender_component()\` dependencies. */}
        <Dep />
    </div>;
}
