import { tsDep } from './ts_dep.mjs';
import { render as renderDep } from './dep.mjs';

/** Prerenders this component using other components. */
export function render(): string {
    return `
        <div class="component">
            <span class="content">I'm a component!</span>

            <!-- Can use basic \`ts_project()\` dependencies. -->
            <span class="ts-dep">${tsDep()}</span>

            <!-- Can compose other \`prerender_component()\` dependencies. -->
            ${renderDep()}
        </div>
    `;
}
