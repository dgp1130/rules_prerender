"""Re-exports public Starlark symbols."""

load(":prerender_component.bzl", _prerender_component = "prerender_component")
load(":prerender_page.bzl", _prerender_page = "prerender_page")

prerender_component = _prerender_component
prerender_page = _prerender_page
