"""Re-exports public Starlark symbols."""

load(":inject_resources.bzl", _inject_resources = "inject_resources")
load(":prerender_component.bzl", _prerender_component = "prerender_component")
load(":prerender_page.bzl", _prerender_page = "prerender_page")
load(
    ":prerender_page_bundled.bzl",
    _prerender_page_bundled = "prerender_page_bundled",
)

inject_resources = _inject_resources
prerender_component = _prerender_component
prerender_page = _prerender_page
prerender_page_bundled = _prerender_page_bundled
