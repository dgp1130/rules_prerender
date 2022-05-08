load("@build_bazel_rules_nodejs//:providers.bzl", "JSModuleInfo")

# TODO: Is there a built-in rule which does this?
def _transitive_js_sources_impl(ctx):
    return DefaultInfo(files = ctx.attr.dep[JSModuleInfo].sources)

transitive_js_sources = rule(
    implementation = _transitive_js_sources_impl,
    attrs = {
        "dep": attr.label(
            mandatory = True,
            providers = [JSModuleInfo],
        ),
    },
)
