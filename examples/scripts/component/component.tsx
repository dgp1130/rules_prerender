import { inlineScript } from '@rules_prerender/preact';
import { VNode } from 'preact';
import { Transitive } from '../transitive/transitive.js';

/** Renders HTML which expects a JavaScript library to be included. */
export function Component(): VNode {
    return <>
        <div>I'm a component with some JavaScript!</div>
        <div id="component-replace">
            This text to be overwritten by client-side JavaScript.
        </div>
        <Transitive />

        <my-pure-component />
        {inlineScript(import.meta, `
import {MyPureComponent} from './examples/scripts/component/pure_component.mjs';
MyPureComponent.define();
        `.trim())}
    </>;
}

declare module 'preact' {
    namespace JSX {
        interface IntrinsicElements {
            'my-pure-component': JSX.HTMLAttributes<HTMLElement>;
        }
    }
}
