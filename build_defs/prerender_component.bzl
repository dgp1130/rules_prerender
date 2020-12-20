"""Defines `prerender_component()` functionality."""

load("@npm//@bazel/typescript:index.bzl", "ts_library")

def prerender_component(
    name,
    srcs,
    lib_deps = [],
    deps = [],
    testonly = None,
    visibility = None,
):
    """Encapsulates an HTML/JS/CSS component for use in prerendering a web page.

    This rule encapsulates the HTML, JavaScript, and CSS resources used by a
    logical "component". A "component" is effectively a fragment of HTML which
    provides some functionality (via JavaScript) and styling (via CSS).
    Components are reusable pieces of UI which can be composed together to build
    a complex static site.

    Note: A prerendered component is not *necessarily* analagous to a web
    component, however they can be used together. A prerendered component may
    use or export a web component to provide functionality to the user.
    
    Args:
        name: The name of this rule.
        srcs: The TypeScript source files for use in prerendering.
        lib_deps: `ts_library()` dependencies for the TypeScript source files.
        deps: `prerender_component()` dependencies for this component.
        testonly: See https://docs.bazel.build/versions/master/be/common-definitions.html.
        visibility: See https://docs.bazel.build/versions/master/be/common-definitions.html.
    """

    ts_library(
        name = "%s_prerender" % name,
        srcs = srcs,
        deps = lib_deps + ["%s_prerender" % dep for dep in deps],
        testonly = testonly,
        visibility = visibility,
    )
