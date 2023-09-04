"""Defines the `css_library()` rule."""

load("@aspect_bazel_lib//lib:copy_to_bin.bzl", "copy_files_to_bin_actions")
load(":css_providers.bzl", "CssInfo")

visibility(["//", "//packages/rules_prerender/..."])

def _css_library_impl(ctx):
    if not ctx.files.srcs and not ctx.files.deps:
        fail("Expected `srcs` and/or `deps` to be specified.")

    # If no `srcs`, re-export dependencies.
    if not ctx.files.srcs:
        return [
            _merge_default_infos([dep[DefaultInfo] for dep in ctx.attr.deps]),
            _merge_css_infos([dep[CssInfo] for dep in ctx.attr.deps]),
        ]

    # Copy sources to bin so they are always available for downstream
    # `js_binary()` tools.
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

If no `srcs` are given, this target re-exports its `deps`. Any direct sources of
direct dependencies are treated like direct sources of this target.
    """.strip(),
)

def _merge_default_infos(infos):
    """Merges the list of `DefaultInfo` providers into a single one."""
    return DefaultInfo(files = depset(
        direct = [],
        transitive = [info.files for info in infos],
    ))

def _merge_css_infos(infos):
    """Merges the given `CssInfo` providers into a single one."""
    return CssInfo(
        direct_sources = [src for info in infos for src in info.direct_sources],
        transitive_sources = depset(
            direct = [],
            transitive = [info.transitive_sources for info in infos],
        ),
    )
