"""Re-exports public Starlark symbols."""

load("//build_defs:prerender_page.bzl", _prerender_page = "prerender_page")

prerender_page = _prerender_page
