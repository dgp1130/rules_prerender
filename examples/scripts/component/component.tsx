import { customElement, define } from '@rules_prerender/preact';
import { VNode } from 'preact';
import { Transitive } from '../transitive/transitive.js';

// @ts-ignore
import { MyHostComponentDef } from './component_script.mjs' with { type: 'symbol-ref' };

// Can use `symbol-ref` import.
const MyHostComponent = customElement('my-host-component', MyHostComponentDef);

// Alternatively, use `define` with `import.meta`.
const MyPureComponent = customElement(
    'my-pure-component',
    define(import.meta, './pure_component.mjs', 'MyPureComponent'),
);

/** Renders HTML which expects a JavaScript library to be included. */
export function Component(): VNode {
    return <>
        <div>I'm a component with some JavaScript!</div>
        <div id="component-replace">
            This text to be overwritten by client-side JavaScript.
        </div>
        <Transitive />

        {/* Imports the component and calls `define` implicitly. */}
        <MyHostComponent>
            {/* Does *not* import the component, HydroActive will enforce that
            the first interaction supplies the definition. */}
            <MyPureComponent defer-hydration />
        </MyHostComponent>
    </>;
}
