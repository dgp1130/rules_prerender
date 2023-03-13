import { includeScript } from '@rules_prerender/preact';
import { VNode } from 'preact';
import { Transitive } from '../transitive/transitive.js';

/** Renders HTML which expects a JavaScript library to be included. */
export function Component(): VNode {
    return <>
        <div>I'm a component with some JavaScript!</div>
        <div id="component-replace">
            This text to be overwritten by client-side JavaScript.
        </div>
        {includeScript('./component_script.mjs', import.meta)}
        <Transitive />
    </>;
}
