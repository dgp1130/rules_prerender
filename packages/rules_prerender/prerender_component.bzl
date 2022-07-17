"""Defines `prerender_component()` functionality."""

load("@build_bazel_rules_nodejs//:index.bzl", "js_library")
load(
    "@build_bazel_rules_nodejs//:providers.bzl",
    "DeclarationInfo",
    "JSModuleInfo",
    "JSEcmaScriptModuleInfo",
)
load("@npm//@bazel/typescript:index.bzl", "ts_project")
load("//common:label.bzl", "absolute")
load("//common:paths.bzl", "is_js_file")
load("//packages/rules_prerender/css:css_binaries.bzl", "css_binaries")
load("//packages/rules_prerender/css:css_group.bzl", "css_group")
load(":web_resources.bzl", "web_resources")

def prerender_component(
    name,
    srcs = None,
    package = None,
    tsconfig = None,
    source_map = None,
    package_name = None,
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
        srcs: The source files for use in prerendering. May be `*.ts` files or
            `*.js`/`*.mjs`/`*.cjs`. All source files must be JavaScript, or all
            source files must be TypeScript. However, mixing the two is not
            allowed. `*.d.ts` files are also allowed in either case.
        tsconfig: A label referencing a tsconfig.json file or `ts_config()`
            target. Will be used to compile `*.ts` files in `srcs`.
        source_map: A boolean indicating whether or not to generate source maps for
            prerendered TypeScript.
        data: See https://docs.bazel.build/versions/master/be/common-definitions.html.
        lib_deps: Dependencies for the source files.
        scripts: List of client-side JavaScript libraries which can be included
            in the prerendered HTML.
        styles: List of `css_library()` targets which can be inlined in prerendered
            HTML.
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
            directly depended upon. This is an alias to the `ts_project()`
            target which compiles the `srcs` of this macro. It does **not**
            include client side scripts, CSS, or other resources used by the
            component. It is intended purely for testing purposes to assert that
            prerender logic works as intended and is marked `testonly`
            accordingly.
    """
    # TODO
    if srcs and package:
        fail("srcs and package both set.")
    if not srcs and not package:
        fail("Neither srcs nor package are set.")

    prerender_lib = "%s_prerender" % name
    if srcs and all([src.endswith(".ts") or src.endswith(".d.ts") for src in srcs]):
        prerender_ts = "%s_ts" % prerender_lib
        ts_project(
            name = prerender_ts,
            srcs = srcs,
            tsconfig = tsconfig,
            source_map = source_map,
            data = data,
            # A `prerender_component()` can't compose other `prerender_component()` targets
            # unless `declaration = True`, so we always set it.
            declaration = True,
            deps = lib_deps + ["%s_prerender" % absolute(dep) for dep in deps],
            testonly = testonly,
        )

        # Re-export compiled TS as a `js_library()` so `package_name` can be declared.
        js_library(
            name = prerender_lib,
            package_name = package_name,
            testonly = testonly,
            visibility = visibility,
            deps = [":%s" % prerender_ts],
        )
    elif srcs and all([is_js_file(src) or src.endswith(".d.ts") for src in srcs]):
        if tsconfig:
            fail("Cannot set a `tsconfig.json` file for a JS-based" +
                " `prerender_component()`, don't set the `tsconfig` attribute.")
        if source_map:
            fail("Cannot generate a source map for a JS-based `prerender_component()`," +
                " don't set `source_map = True`.")

        js_library(
            name = prerender_lib,
            srcs = srcs + data, # `data` is included in `srcs`.
            package_name = package_name,
            deps = lib_deps + ["%s_prerender" % absolute(dep) for dep in deps],
            testonly = testonly,
            visibility = visibility,
        )
    elif package:
        native.alias(
            name = prerender_lib,
            actual = package,
            testonly = testonly,
            visibility = visibility,
        )
    else:
        fail(" ".join("""
All sources must be TypeScript (`*.ts`) or all sources must be JavaScript
(`*.js` / `*.mjs` / `*.cjs`). It is not possible to use some JavaScript sources
and some TypeScript sources in the same component (excluding `*.d.ts` files,
which are always allowed).
        """.strip().split("\n")))

    native.alias(
        name = "%s_prerender_for_test" % name,
        actual = ":%s" % prerender_lib,
        testonly = True,
    )

    if not package:
        _js_reexport(
            name = "%s_scripts" % name,
            srcs = scripts,
            deps = ["%s_scripts" % absolute(dep) for dep in deps],
            testonly = testonly,
            visibility = visibility,
        )
    else:
        native.alias(
            name = "%s_scripts" % name,
            actual = package,
            testonly = testonly,
            visibility = visibility,
        )

    _inline_css_reexport(
        name = "%s_styles" % name,
        styles = styles,
        testonly = testonly,
        visibility = visibility,
        deps = ["%s_styles" % absolute(dep) for dep in deps],
    )

    web_resources(
        name = "%s_resources" % name,
        testonly = testonly,
        visibility = visibility,
        deps = resources + ["%s_resources" % absolute(dep) for dep in deps],
    )

def _merge_js_module_infos(srcs, deps):
    if all([JSModuleInfo not in dep for dep in srcs + deps]):
        return None

    return JSModuleInfo(
        direct_sources = depset([],
            transitive = [src[JSModuleInfo].direct_sources
                          for src in srcs
                          if JSModuleInfo in src],
        ),
        sources = depset([],
            transitive = [dep[JSModuleInfo].sources
                          for dep in srcs + deps
                          if JSModuleInfo in dep],
        ),
    )

def _merge_js_ecma_script_module_infos(srcs, deps):
    if all([JSEcmaScriptModuleInfo not in dep for dep in srcs + deps]):
        return None

    return JSEcmaScriptModuleInfo(
        direct_sources = depset([],
            transitive = [src[JSEcmaScriptModuleInfo].direct_sources
                          for src in srcs
                          if JSEcmaScriptModuleInfo in src],
        ),
        sources = depset([],
            transitive = [dep[JSEcmaScriptModuleInfo].sources
                          for dep in srcs + deps
                          if JSEcmaScriptModuleInfo in dep],
        ),
    )

def _js_reexport_impl(ctx):
    providers = []

    merged_declaration_info = DeclarationInfo(
        declarations = depset([],
            transitive = [src[DeclarationInfo].declarations
                          for src in ctx.attr.srcs
                          if DeclarationInfo in src],
        ),
        transitive_declarations = depset([],
            transitive = [dep[DeclarationInfo].transitive_declarations
                          for dep in ctx.attr.srcs + ctx.attr.deps
                          if DeclarationInfo in dep],
        ),
        type_blocklisted_declarations = depset([],
            transitive = [dep[DeclarationInfo].type_blocklisted_declarations
                          for dep in ctx.attr.srcs + ctx.attr.deps
                          if DeclarationInfo in dep],
        ),
    )

    merged_js_module_info = _merge_js_module_infos(ctx.attr.srcs, ctx.attr.deps)
    if merged_js_module_info:
        providers.append(merged_js_module_info)

    merged_js_ecma_script_module_info = _merge_js_ecma_script_module_infos(
        ctx.attr.srcs, ctx.attr.deps)
    if merged_js_ecma_script_module_info:
        providers.append(merged_js_ecma_script_module_info)

    return providers + [
        DefaultInfo(files = depset([],
            transitive = [src[DefaultInfo].files for src in ctx.attr.srcs if DefaultInfo in src] +
                         [dep[DefaultInfo].files for dep in ctx.attr.deps if DefaultInfo in dep],
        )),
        merged_declaration_info,
    ]

_js_reexport = rule(
    implementation = _js_reexport_impl,
    attrs = {
        "srcs": attr.label_list(default = []),
        "deps": attr.label_list(default = []),
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

def _inline_css_reexport(name, styles, deps, testonly = None, visibility = None):
    for style in styles:
        if style.endswith(".css"):
            fail(("`styles` must be `css_library()` targets, *not* `*.css`"
                + " source files (%s)") % style)

    binaries = "%s_bin" % name
    css_binaries(
        name = binaries,
        testonly = testonly,
        deps = styles,
    )

    css_group(
        name = name,
        testonly = testonly,
        visibility = visibility,
        deps = [":%s" % binaries] + deps,
    )
