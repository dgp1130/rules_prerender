# Custom Bundling

An example which uses `prerender_multi_page()` instead of `prerender_pages()` to
skip the bundling step. It leaves bundling JavaScript and CSS as a matter for
the user, who can then leverage `extract_single_resource()`,
`inject_resources()`, and `web_resources()` to assemble the bundled content
together.

It happens to use [Rollup](https://rollupjs.org/) to bundle JavaScript here, but
any bundler could reasonably be used.

CSS is **not** bundled in this example, because frankly it is a PITA to do
manually. Conceptually it works the same way as JavaScript bundling, given a
bunch of CSS source files output by `prerender_mutli_page()`, bundle them into
one or more CSS files, then inject the result into the HTML page.
