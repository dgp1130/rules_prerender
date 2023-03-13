# JavaScript

An example which uses JavaScript source files (as opposed to TypeScript) to
render a component and execute client-side scripts.

This uses Preact via the `h` function, which doesn't require any transpilation.
`prerender_component()` doesn't provide any JSX support for JavaScript sources
(though it does for TypeScript sources). If using Preact with JavaScript for a
real application, you may want to invest in a more ergonomic, compiler-less API
such as [`htm`](https://github.com/developit/htm/).
