# Declarative Shadow DOM

An example which uses
[Declarative Shadow DOM](https://web.dev/declarative-shadow-dom/) to author
components with strong style isolation.

This uses the `//:node_modules/@rules_prerender/declarative_shadow_dom` component
dependency to easily inject the Declarative Shadow DOM polyfill into the
generated web page.

The example also accepts input DOM and wraps it, however input DOM is insert as
light DOM and placed with a `<slot></slot>` tag. This prevents the input from
being included under the shadow root and having component-private styles applied
to it. See [component.ts](./component.ts).
