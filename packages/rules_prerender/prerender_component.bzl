"""Defines `prerender_component()` functionality."""

load("@npm//@bazel/typescript:index.bzl", "ts_library")
load("//common:label.bzl", "absolute")
load(":web_resources.bzl", "web_resources")

def prerender_component(
    name,
    srcs,
    tsconfig = None,
    data = [],
    lib_deps = [],
    scripts = [],
    styles = [],
    resources = [],
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
        tsconfig: A label referencing a tsconfig.json file or `ts_config()`
            target. Will be used to compile files in `srcs`.
        data: See https://docs.bazel.build/versions/master/be/common-definitions.html.
        lib_deps: `ts_library()` dependencies for the TypeScript source files.
        scripts: List of client-side JavaScript libraries which can be included
            in the prerendered HTML.
        styles: List of CSS files or `filegroup()`s of CSS files which can be
            included in the prerendered HTML.
        resources: List of `web_resources()` required by this component at
            runtime.
        deps: `prerender_component()` dependencies for this component.
        testonly: See https://docs.bazel.build/versions/master/be/common-definitions.html.
        visibility: See https://docs.bazel.build/versions/master/be/common-definitions.html.
    
    Outputs:
        `%{name}`: A compiled prerender component for use by other
            `prerender_*()` rules/macros. This is not a real target as this
            actually macro outputs several targets at `%{name}_*`. These are
            **not** intended to be directly depended upon because it would be
            very easy to accidentally depend on one part of a component (such as
            the prerendered HTML) without also depending all the other parts
            (such as the CSS) for it to work as expected. Instead of using the
            outputs of this macro directly, use another `prerender_*()`
            macro/rule to depend on and use this correctly.
        `%{name}_prerender_for_test`: There is one exception which can be
            directly depended upon. This is an alias to the `ts_library()`
            target which compiles the `srcs` of this macro. It does **not**
            include client side scripts, CSS, or other resources used by the
            component. It is intended purely for testing purposes to assert that
            prerender logic works as intended and is marked `testonly`
            accordingly.
    """

    prerender_lib = "%s_prerender" % name
    ts_library(
        name = prerender_lib,
        srcs = srcs,
        tsconfig = tsconfig,
        data = data + styles,
        deps = lib_deps + ["%s_prerender" % absolute(dep) for dep in deps],
        testonly = testonly,
        visibility = visibility,
    )

    native.alias(
        name = "%s_prerender_for_test" % name,
        actual = ":%s" % prerender_lib,
        testonly = True,
    )

    ts_library(
        name = "%s_scripts" % name,
        srcs = [],
        deps = scripts + ["%s_scripts" % absolute(dep) for dep in deps],
        testonly = testonly,
        visibility = visibility,
    )

    native.filegroup(
        name = "%s_styles" % name,
        srcs = styles + ["%s_styles" % absolute(dep) for dep in deps],
        testonly = testonly,
        visibility = visibility,
    )

    web_resources(
        name = "%s_resources" % name,
        testonly = testonly,
        visibility = visibility,
        deps = resources + ["%s_resources" % absolute(dep) for dep in deps],
    )
