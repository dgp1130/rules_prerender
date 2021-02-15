"""Re-exports public Starlark symbols."""

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
    "//packages/rules_prerender:prerender_multi_page_bundled.bzl",
    _prerender_multi_page_bundled = "prerender_multi_page_bundled",
)
load(
    "//packages/rules_prerender:prerender_page.bzl",
    _prerender_page = "prerender_page",
)
load(
    "//packages/rules_prerender:prerender_page_bundled.bzl",
    _prerender_page_bundled = "prerender_page_bundled",
)
load(
    "//packages/rules_prerender:web_resources.bzl",
    _web_resources = "web_resources",
)
load(
    "//packages/rules_prerender:web_resources_devserver.bzl",
    _web_resources_devserver = "web_resources_devserver",
)

inject_resources = _inject_resources
prerender_component = _prerender_component
prerender_multi_page = _prerender_multi_page
prerender_multi_page_bundled = _prerender_multi_page_bundled
prerender_page = _prerender_page
prerender_page_bundled = _prerender_page_bundled
web_resources = _web_resources
web_resources_devserver = _web_resources_devserver
