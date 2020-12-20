"""Re-exports public Starlark symbols."""

load(
    "//build_defs:prerender_component.bzl",
    _prerender_component = "prerender_component",
)
load("//build_defs:prerender_page.bzl", _prerender_page = "prerender_page")

prerender_component = _prerender_component
prerender_page = _prerender_page
