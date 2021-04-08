"""Re-exports public Starlark symbols."""

load(
    "//packages/rules_prerender:extract_single_resource.bzl",
    _extract_single_resource = "extract_single_resource"
)
load(
    "//packages/rules_prerender:inject_resources.bzl",
    _inject_resources = "inject_resources",
)
load(
    "//packages/rules_prerender:prerender_component.bzl",
    _prerender_component = "prerender_component",
)
load(
    "//packages/rules_prerender:prerender_multi_page.bzl",
    _prerender_multi_page = "prerender_multi_page",
)
load(
    "//packages/rules_prerender:prerender_pages.bzl",
    _prerender_pages = "prerender_pages",
)
load(
    "//packages/rules_prerender:web_resources.bzl",
    _web_resources = "web_resources",
)
load(
    "//packages/rules_prerender:web_resources_devserver.bzl",
    _web_resources_devserver = "web_resources_devserver",
)

extract_single_resource = _extract_single_resource
inject_resources = _inject_resources
prerender_component = _prerender_component
prerender_multi_page = _prerender_multi_page
prerender_pages = _prerender_pages
web_resources = _web_resources
web_resources_devserver = _web_resources_devserver
