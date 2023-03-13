import { includeScript } from '@rules_prerender/preact';
import { VNode } from 'preact';

/** Renders HTML which expects a JavaScript library to be included. */
export function Transitive(): VNode {
    return <>
        <div>I'm a transitive component with some JavaScript!</div>
        <div id="transitive-replace">
            This text to be overwritten by client-side JavaScript.
        </div>
        {includeScript('./transitive_script.mjs', import.meta)}
    </>;
}
