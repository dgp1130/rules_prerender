"""Defines `prerender_component()` functionality."""

load("@build_bazel_rules_nodejs//:providers.bzl", "JSModuleInfo")
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
    """

    strict_deps_src = "%s_strict_deps.ts" % name
    _strict_deps(
        name = "%s_strict_deps" % name,
        scripts = scripts,
        output = strict_deps_src,
    )

    strict_deps_lib = "%s_strict_deps_lib" % name
    ts_library(
        name = strict_deps_lib,
        srcs = [strict_deps_src],
        tsconfig = tsconfig,
        testonly = testonly,
        deps = ["//packages/rules_prerender"],
    )

    ts_library(
        name = "%s_prerender" % name,
        srcs = srcs,
        tsconfig = tsconfig,
        data = data,
        deps = lib_deps + ["%s_prerender" % absolute(dep) for dep in deps] + [
            ":%s" % strict_deps_lib,
        ],
        testonly = testonly,
        visibility = visibility,
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

def _strict_deps_impl(ctx):
    js_module_infos = [script[JSModuleInfo] for script in ctx.attr.scripts]
    direct_sources = [source
                      for module in js_module_infos
                      for source in module.direct_sources.to_list()]
    strict_scripts = ["%s/%s" % (
                          ctx.workspace_name,
                          source.short_path[:-len("." + source.extension)],
                      ) for source in direct_sources]

    script_type = " | ".join(["'%s'" % script for script in strict_scripts])
    ctx.actions.write(ctx.outputs.output, """
declare module 'rules_prerender' {
    // interface PrerenderResource {
    //     of(path: string, contents: string | ArrayBuffer | TypedArray): {
    //         urlPath: {
    //             path: string;
    //         };
    //         contents: ArrayBuffer;
    //     }
    // }
    // export function includeScript(script: s): string;
    export interface includeScript {
        (script: %s): string;
    }

type TypedArray =
    Int8Array
    | Uint8Array
    | Int16Array
    | Uint16Array
    | Int32Array
    | Uint32Array
    | Uint8ClampedArray
    | Float32Array
    | Float64Array;
}
    """.strip() % script_type)

_strict_deps = rule(
    implementation = _strict_deps_impl,
    attrs = {
        "scripts": attr.label_list(
            mandatory = True,
            providers = [JSModuleInfo],
        ),
        "output": attr.output(mandatory = True),
    },
)

def _encode_json(value):
    """Hack to serialize the given value as JSON."""
    json = struct(value = value).to_json()
    return json[len("{\"value\":"):-len("}")]
