"""Defines `prerender_component()` functionality."""

load("@aspect_rules_js//js:defs.bzl", "js_library")
load("@aspect_rules_js//js:providers.bzl", "JsInfo", "js_info")
load("@aspect_rules_ts//ts:defs.bzl", "ts_project")
load("//common:label.bzl", "absolute")
load("//common:paths.bzl", "is_js_file", "is_ts_file", "is_ts_declaration_file")
load("//packages/rules_prerender/css:css_binaries.bzl", "css_binaries")
load("//packages/rules_prerender/css:css_group.bzl", "css_group")
load("//packages/rules_prerender/css:css_library.bzl", "css_library")
load(
    ":prerender_metadata.bzl",
    "PrerenderMetadataInfo",
    "alias_with_metadata",
    "prerender_metadata",
)
load(":web_resources.bzl", "web_resources")

visibility("public")

def prerender_component(
    name,
    prerender = None,
    scripts = None,
    styles = None,
    resources = None,
    testonly = None,
    visibility = None,
):
    """TODO"""
    # TODO: Assert _something_ provided.

    styles_reexport = "%s_styles_reexport" % name
    if styles:
        _inline_css_reexport(
            name = styles_reexport,
            styles = styles,
            visibility = visibility,
            testonly = testonly,
        )

    # Metadata provider.
    metadata = "%s_metadata" % name
    prerender_metadata(
        name = metadata,
        prerender = prerender,
        scripts = scripts,
        styles = ":%s" % styles_reexport if styles else None,
        styles_import_map = ":%s" % styles_reexport if styles else None,
        resources = resources,
        testonly = testonly,
    )

    # Prerendering JavaScript.
    # TODO: Make optional?
    alias_with_metadata(
        name = "%s_prerender" % name,
        metadata = ":%s" % metadata,
        actual = prerender,
        visibility = visibility,
        testonly = testonly,
    )

    # Client-side JavaScript.
    scripts_target = "%s_scripts" % name
    if scripts:
        alias_with_metadata(
            name = scripts_target,
            metadata = ":%s" % metadata,
            actual = scripts,
            visibility = visibility,
            testonly = testonly,
        )
    else:
        js_library(
            name = scripts_target,
            srcs = [],
            visibility = visibility,
            testonly = testonly,
        )

    # CSS styles.
    styles_target = "%s_styles" % name
    if styles:
        alias_with_metadata(
            name = styles_target,
            metadata = metadata,
            actual = ":%s" % styles_reexport,
            testonly = testonly,
            visibility = visibility,
        )

    # Resources.
    resources_target = "%s_resources" % name
    if resources:
        alias_with_metadata(
            name = resources_target,
            metadata = ":%s" % metadata,
            actual = resources,
            visibility = visibility,
            testonly = testonly,
        )

def _js_reexport_impl(ctx):
    merged_js_info = js_info(
        declarations = depset([],
            transitive = [src[JsInfo].declarations
                          for src in ctx.attr.srcs],
        ),
        npm_linked_package_files = depset([],
            transitive = [src[JsInfo].npm_linked_package_files
                          for src in ctx.attr.srcs],
        ),
        npm_linked_packages = depset([],
            transitive = [src[JsInfo].npm_linked_packages
                          for src in ctx.attr.srcs],
        ),
        npm_package_store_deps = depset([],
            transitive = [src[JsInfo].npm_package_store_deps
                          for src in ctx.attr.srcs],
        ),
        sources = depset([],
            transitive = [src[JsInfo].sources
                          for src in ctx.attr.srcs],
        ),
        transitive_declarations = depset([],
            transitive = [dep[JsInfo].transitive_declarations
                          for dep in ctx.attr.srcs + ctx.attr.deps],
        ),
        transitive_npm_linked_package_files = depset([],
            transitive = [dep[JsInfo].transitive_npm_linked_package_files
                          for dep in ctx.attr.srcs + ctx.attr.deps],
        ),
        transitive_npm_linked_packages = depset([],
            transitive = [dep[JsInfo].transitive_npm_linked_packages
                          for dep in ctx.attr.srcs + ctx.attr.deps],
        ),
        transitive_sources = depset([],
            transitive = [dep[JsInfo].transitive_sources
                          for dep in ctx.attr.srcs + ctx.attr.deps],
        ),
    )

    return [
        DefaultInfo(files = merged_js_info.sources),
        merged_js_info,
    ]

_js_reexport = rule(
    implementation = _js_reexport_impl,
    attrs = {
        "srcs": attr.label_list(
            default = [],
            providers = [JsInfo],
        ),
        "deps": attr.label_list(
            default = [],
            providers = [JsInfo],
        ),
    },
    doc = """
        Re-exports the given `ts_project()` and `js_library()` targets. Targets
        in `srcs` have their direct sources re-exported as the direct sources of
        this target, while targets in `deps` are only included as transitive
        sources.

        This rule serves two purposes:
        1.  It re-exports **both** `ts_project()` and `js_library()`.
        2.  It merges multiple targets together, depending on all of them but
            only re-exporting direct sources from the `srcs` attribute. Even
            with `ts_project()` re-export it is not possible to re-export only
            some of the given targets.
    """,
)

def _inline_css_reexport(name, styles, testonly = None, visibility = None):
    css_binaries(
        name = name,
        testonly = testonly,
        deps = [styles],
    )
