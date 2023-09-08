# Documentation Site

This is the documentation site for `@rules_prerender`.

Hosted at https://rules-prerender.dwac.dev/.

The site itself is generated with `@rules_prerender` as an alpha tester of new
features.

## Markdown Conventions

Most pages are authored in markdown and processed through the same content
pipeline. Markdown pages support frontmatter and must adhere to a specific
schema documented below. This schema is implemented in
[`markdown_page.mts`](/docs/markdown/markdown_page.mts) and should give solid
error messages when not followed correctly.

| Option  | Semantics |
| ------- | --------- |
| `title` | Defines the title of the generated page. This is used by the `<title>` tag as well as rendered in the page body. Markdown pages should _not_ use a `# h1` header. |
