"""Re-exports public Starlark symbols."""

load(":inject_resources.bzl", _inject_resources = "inject_resources")
load(":prerender_component.bzl", _prerender_component = "prerender_component")
load(":prerender_page.bzl", _prerender_page = "prerender_page")

inject_resources = _inject_resources
prerender_component = _prerender_component
prerender_page = _prerender_page
