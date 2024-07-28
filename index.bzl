"""Re-exports public Starlark symbols."""

load(
    "//packages/rules_prerender:extract_single_resource.bzl",
    _extract_single_resource = "extract_single_resource",
)
load(
    "//packages/rules_prerender:inject_resources.bzl",
    _inject_resources = "inject_resources",
)
load(
    "//packages/rules_prerender:link_prerender_component.bzl",
    _link_prerender_component = "link_prerender_component",
)
load(
    "//packages/rules_prerender:prerender_component.bzl",
    _prerender_component = "prerender_component",
)
load(
    "//packages/rules_prerender:prerender_component_publish_files.bzl",
    _prerender_component_publish_files = "prerender_component_publish_files",
)
load(
    "//packages/rules_prerender:prerender_pages.bzl",
    _prerender_pages = "prerender_pages",
)
load(
    "//packages/rules_prerender:prerender_pages_unbundled.bzl",
    _prerender_pages_unbundled = "prerender_pages_unbundled",
)
load(
    "//packages/rules_prerender:prerender_resources.bzl",
    _prerender_resources = "prerender_resources",
)
load(
    "//packages/rules_prerender:web_resources.bzl",
    _web_resources = "web_resources",
)
load(
    "//packages/rules_prerender:web_resources_devserver.bzl",
    _web_resources_devserver = "web_resources_devserver",
)
load(
    "//packages/rules_prerender/css:css_library.bzl",
    _css_library = "css_library",
)

css_library = _css_library
extract_single_resource = _extract_single_resource
inject_resources = _inject_resources
link_prerender_component = _link_prerender_component
prerender_component = _prerender_component
prerender_component_publish_files = _prerender_component_publish_files
prerender_pages_unbundled = _prerender_pages_unbundled
prerender_pages = _prerender_pages
prerender_resources = _prerender_resources
web_resources = _web_resources
web_resources_devserver = _web_resources_devserver
