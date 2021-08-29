# TS/JS

An example which verifies interoperability between TypeScript and JavaScript
`prerender_component()` targets. This includes a TypeScript component which
depends on a JavaScript component. It also includes a JavaScript component which
depends on a TypeScript component.

JavaScript depending on TypeScript works as you would expect. TypeScript
depending on JavaScript also works but has the additional requirement that the
JavaScript code must include a `.d.ts` file to provide typings for it.

JavaScript for prerendering needs to be written in CommonJS format, while
client-side JavaScript should be written ESM format.
