
"""Example of a rule that requires ES6 inputs.
"""

# From: https://github.com/bazelbuild/rules_nodejs/blob/1433eb91c69447c60dda92c6e789907a734f468c/packages/typescript/test/es6_consumer/es6_consumer.bzl

load("@build_bazel_rules_nodejs//:providers.bzl", "JSEcmaScriptModuleInfo")

def _es6_consumer(ctx):
    sources_depsets = []
    for dep in ctx.attr.deps:
        if JSEcmaScriptModuleInfo in dep:
            sources_depsets.append(dep[JSEcmaScriptModuleInfo].sources)
    sources = depset(transitive = sources_depsets)

    return [DefaultInfo(
        files = sources,
        runfiles = ctx.runfiles(transitive_files = sources),
    )]

es6_consumer = rule(
    implementation = _es6_consumer,
    attrs = {
        "deps": attr.label_list(),
    },
)
