# Custom Bundling

An example which uses `prerender_pages_unbundled()` instead of
`prerender_pages()` to skip the bundling step. It leaves bundling JavaScript
as a matter for the user, who can then leverage `extract_single_resource()`,
`inject_resources()`, and `web_resources()` to assemble the bundled content
together.

It happens to use [Rollup](https://rollupjs.org/) to bundle JavaScript here, but
any bundler could reasonably be used.
