"""Defines the `css_library()` rule."""

load(":css_providers.bzl", "CssInfo")

def _css_library_impl(ctx):
    return [
        DefaultInfo(files = depset(ctx.files.srcs)),
        CssInfo(
            direct_sources = ctx.files.srcs,
            transitive_sources = depset(ctx.files.srcs,
                transitive = [dep[CssInfo].transitive_sources
                            for dep in ctx.attr.deps],
            ),
        ),
    ]

css_library = rule(
    implementation = _css_library_impl,
    attrs = {
        "srcs": attr.label_list(
            allow_files = [".css"],
            doc = "List of CSS source files in this library.",
        ),
        "deps": attr.label_list(
            providers = [CssInfo],
            doc = """
List of other `css_library()` dependencies with sources imported by this target's sources.
            """.strip(),
        ),
    },
    doc = """
A library of CSS source files and their `@import` dependencies.

This rule does not currently implement any form of strict dependencies, take care to
manage your imports and dependencies.
    """.strip(),
)
