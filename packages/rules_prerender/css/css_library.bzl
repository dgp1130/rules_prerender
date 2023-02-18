"""Defines the `css_library()` rule."""

load("@aspect_bazel_lib//lib:copy_to_bin.bzl", "copy_files_to_bin_actions")
load(":css_providers.bzl", "CssInfo")

def _css_library_impl(ctx):
    # Copy sources to bin so they are always available for downstream `js_binary()`
    # tools.
    copied = copy_files_to_bin_actions(ctx, ctx.files.srcs)

    return [
        DefaultInfo(files = depset(copied)),
        CssInfo(
            direct_sources = copied,
            transitive_sources = depset(copied,
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
