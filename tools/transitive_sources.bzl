"""Defines `transitive_sources()`."""

load("@build_bazel_rules_nodejs//:providers.bzl", "JSModuleInfo")

def _transitive_sources_impl(ctx):
    return DefaultInfo(files = ctx.attr.dep[JSModuleInfo].sources)

transitive_sources = rule(
    implementation = _transitive_sources_impl,
    attrs = {
        "dep": attr.label(
            mandatory = True,
            providers = [JSModuleInfo],
        ),
    },
    doc = """
        Collects all the transitive JS sources of the given dependency
        and returns them in `DefaultInfo`.
    """,
)
