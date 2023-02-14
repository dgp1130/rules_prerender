load("@aspect_rules_js//js:providers.bzl", "JsInfo", "js_info")
load("@aspect_rules_ts//ts:defs.bzl", _ts_project = "ts_project")

def ts_project(name, tsconfig = None, **kwargs):
    _ts_project(
        name = name,
        tsconfig = tsconfig or "//:tsconfig",
        declaration = True,
        source_map = True,
        **kwargs
    )

def _types_only_impl(ctx):
    info = ctx.attr.dep[JsInfo]
    return js_info(
        declarations = info.declarations,
        npm_linked_package_files = depset(),
        npm_linked_packages = depset(),
        npm_package_store_deps = depset(),
        sources = depset(),
        transitive_declarations = info.transitive_declarations,
        transitive_npm_linked_package_files = depset(),
        transitive_npm_linked_packages = depset(),
        transitive_sources = depset(),
    )

types_only = rule(
    implementation = _types_only_impl,
    attrs = {
        "dep": attr.label(
            mandatory = True,
            providers = [JsInfo],
            doc = "`ts_project()` to remove JS implementation from."
        ),
    },
    doc = "Provides only the types of the given dependency, no implementation.",
)
