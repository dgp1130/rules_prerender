"""Defines `prerender_component_publish_files()`."""

load(
    "@build_bazel_rules_nodejs//:providers.bzl",
    "DeclarationInfo",
    "JSEcmaScriptModuleInfo",
    "JSModuleInfo",
)
load("//common:label.bzl", "absolute")

def prerender_component_publish_files(
    name,
    dep,
    testonly = None,
    **kwargs,
):
    """Collects all the files in a `prerender_component()` for publishing.
    
    This is useful when publishing a `prerender_component()` to NPM for another
    repository to consume. You probably want to author the component in
    TypeScript but ship it as JavaScript (with `.d.ts` files). This macro takes
    a `prerender_component()` and extracts all the files that need to be
    published. In the NPM package, another `prerender_component()` can consume
    these files and make the component available to users like any other.

    Params:
        name: The name of this target.
        dep: The `prerender_component()` to publish.
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

    # Collect ES5 JS for prerendering.
    prerender_js = "%s_prerender_js" % name
    _es5_transitive_sources(
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

    # Collect ES6 JS for scripts.
    scripts_js = "%s_scripts_js" % name
    _es6_transitive_sources(
        name = scripts_js,
        target = "%s_scripts" % absolute_name,
        testonly = testonly,
    )

    # Collect all the files to be published for the component.
    native.filegroup(
        name = name,
        srcs = [
            ":%s" % prerender_dts,
            ":%s" % prerender_js,
            ":%s" % scripts_dts,
            ":%s" % scripts_js,
            "%s_styles" % absolute_name, # inlined `*.css` files.
            "%s_resources" % absolute_name, # resource files.
        ],
        testonly = testonly,
        **kwargs
    )

def _transitive_declarations_impl(ctx):
    return DefaultInfo(
        files = ctx.attr.target[DeclarationInfo].transitive_declarations,
    )

_transitive_declarations = rule(
    implementation = _transitive_declarations_impl,
    attrs = {
        "target": attr.label(
            mandatory = True,
            providers = [DeclarationInfo],
            doc = "Target to collect transitive declarations of.",
        ),
    },
    doc = """
        Provides a `DefaultInfo` with all the transitive TS declarations of the
        given target.
    """,
)

def _es5_transitive_sources_impl(ctx):
    return DefaultInfo(files = ctx.attr.target[JSModuleInfo].sources)

_es5_transitive_sources = rule(
    implementation = _es5_transitive_sources_impl,
    attrs = {
        "target": attr.label(
            mandatory = True,
            providers = [JSModuleInfo],
            doc = "Target to collect ES5 transitive sources of.",
        ),
    },
    doc = """
        Provides a `DefaultInfo` with all the transitive ES5 sources of the
        given target.
    """,
)

def _es6_transitive_sources_impl(ctx):
    return DefaultInfo(files = ctx.attr.target[JSEcmaScriptModuleInfo].sources)

_es6_transitive_sources = rule(
    implementation = _es6_transitive_sources_impl,
    attrs = {
        "target": attr.label(
            mandatory = True,
            providers = [JSEcmaScriptModuleInfo],
            doc = "Target to collect ES6 transitive sources of.",
        ),
    },
    doc = """
        Provides a `DefaultInfo` with all the transitive ES6 sources of the
        given target.
    """,
)
