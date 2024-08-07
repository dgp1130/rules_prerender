"""Defines `prerender_component_publish_files()`."""

load("@aspect_rules_js//js:providers.bzl", "JsInfo")
load("//common:label.bzl", "absolute")

visibility(["//"])

def prerender_component_publish_files(
        name,
        dep,
        collect_styles = True,
        collect_resources = True,
        testonly = None,
        **kwargs):
    """Collects all the files in a `prerender_component()` for publishing.

    This is useful when publishing a `prerender_component()` to NPM for another
    repository to consume. You probably want to author the component in
    TypeScript but ship it as JavaScript (with `.d.ts` files). This macro takes
    a `prerender_component()` and extracts all the files that need to be
    published. In the NPM package, another `prerender_component()` can consume
    these files and make the component available to users like any other.

    Args:
        name: The name of this target.
        dep: The `prerender_component()` to publish.
        collect_styles: Whether or not to collect and publish CSS styles. Should
            only be disabled if there are no styles to collect.
        collect_resources: Whether or not to collect and publish resources.
            Should only be disabled if there are no resources to collect.
        testonly: See https://bazel.build/reference/be/common-definitions#common-attributes
        **kwargs: Remaining arguments to pass through to the underlying target.

    Outputs:
        %{name}: A `filegroup()` which provides a `DefaultInfo` that includes
            all the files to be published.
    """
    absolute_name = absolute(dep)

    # Collect declarations for prerendering.
    prerender_dts = "%s_prerender_dts" % name
    _transitive_declarations(
        name = prerender_dts,
        target = "%s_prerender" % absolute_name,
        testonly = testonly,
    )

    # Collect JS for prerendering.
    prerender_js = "%s_prerender_js" % name
    _transitive_js_sources(
        name = prerender_js,
        target = "%s_prerender" % absolute_name,
        testonly = testonly,
    )

    # Collect declarations for scripts.
    scripts_dts = "%s_scripts_dts" % name
    _transitive_declarations(
        name = scripts_dts,
        target = "%s_scripts" % absolute_name,
        testonly = testonly,
    )

    # Collect JS for scripts.
    scripts_js = "%s_scripts_js" % name
    _transitive_js_sources(
        name = scripts_js,
        target = "%s_scripts" % absolute_name,
        testonly = testonly,
    )

    files = [
        ":%s" % prerender_dts,
        ":%s" % prerender_js,
        ":%s" % scripts_dts,
        ":%s" % scripts_js,
    ]

    # Collect CSS files.
    if collect_styles:
        files.append("%s_styles" % absolute_name)

    # Collect static resources.
    if collect_resources:
        files.append("%s_resources" % absolute_name)

    # Collect all the files to be published for the component.
    native.filegroup(
        name = name,
        srcs = files,
        testonly = testonly,
        **kwargs
    )

def _transitive_declarations_impl(ctx):
    return DefaultInfo(files = ctx.attr.target[JsInfo].transitive_declarations)

_transitive_declarations = rule(
    implementation = _transitive_declarations_impl,
    attrs = {
        "target": attr.label(
            mandatory = True,
            providers = [JsInfo],
            doc = "Target to collect transitive declarations of.",
        ),
    },
    doc = """
        Provides a `DefaultInfo` with all the transitive TS declarations of the
        given target.
    """,
)

def _transitive_js_sources_impl(ctx):
    return DefaultInfo(files = ctx.attr.target[JsInfo].transitive_sources)

_transitive_js_sources = rule(
    implementation = _transitive_js_sources_impl,
    attrs = {
        "target": attr.label(
            mandatory = True,
            providers = [JsInfo],
            doc = "Target to collect transitive JavaScript sources of.",
        ),
    },
    doc = """
        Provides a `DefaultInfo` with all the transitive JavaScript sources of the
        given target.
    """,
)
