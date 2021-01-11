# Resources

An example which uses `web_resources()` rules to include external files in the
generated site. Technically, all examples which use `prerender_page_bundled()`
include a `web_resources()` rule because that is its output. However, this
example actually includes custom files and verifies that they are correctly
propagated to the final site.
