# Annotation Extractor

A Bazel tool for processing annotations in a prerendered HTML file. User code
may use `includeScript('some/file.js')` directly in an HTML template. This
simply inserts an HTML comment which looks like:

```html
<!-- bazel:rules_prerender:PRIVATE_DO_NOT_DEPEND_OR_ELSE - {"type":"script","path":"some/file.js"} -->
```

This comment is considered a prerender *annotation*, telling the build system
that `some/file.js` should be included in the final HTML page. The annotation
extractor tool parses an HTML file and extracts all the annotations. It outputs
a JSON file containing all the deduplicated annotations from the HTML file, as
well a new HTML file with the annotations removed.

## Why is this necessary?

This is to support tree shaking resources from components. If a file exports a
`renderSomeComponent()` function which happens to include `some_component.js`,
that JavaScript should be bundle into the final page **only** if
`renderSomeComponent()` is actually called. With this design, the developer uses
`includeScript('some_component.js')` in `renderSomeComponent()` so an annotation
is placed. The actual JavaScript is only included if that annotation is later
read from the final HTML page.
