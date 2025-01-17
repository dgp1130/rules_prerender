import { customElement, define } from '@rules_prerender/preact';
import { VNode } from 'preact';
import { Transitive } from '../transitive/transitive.js';

const MyHostComponent = customElement('my-host-component');
const MyPureComponent = customElement('my-pure-component');

/** Renders HTML which expects a JavaScript library to be included. */
export function Component(): VNode {
    return <>
        <div>I'm a component with some JavaScript!</div>
        <div id="component-replace">
            This text to be overwritten by client-side JavaScript.
        </div>
        <Transitive />

        {/* Error: Requires either `defer-hydration` or `definition`. */}
        {/* <MyHostComponent /> */}

        {/* Imports the component and calls `define`. */}
        <MyHostComponent definition={
            define(import.meta, './component_script.mjs', 'MyHostComponent')
        }>
            {/* Does *not* import the component, HydroActive will enforce that
            the first interaction supplies the definition. */}
            <MyPureComponent defer-hydration />
        </MyHostComponent>
    </>;
}
