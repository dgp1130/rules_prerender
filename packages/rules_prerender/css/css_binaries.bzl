"""Defines `css_binaries()` and related rules."""

load("@npm//@bazel/postcss:index.bzl", "postcss_multi_binary")
load(
    "//packages/rules_prerender:postcss_import_plugin.bzl",
    IMPORT_PLUGIN_CONFIG = "PLUGIN_CONFIG",
)
load(":css_group.bzl", "css_group")
load(":css_map.bzl", "css_map")
load(":css_providers.bzl", "CssInfo")
load(":parcel_bundle.bzl", "parcel_bundle")

def css_binaries(
    name,
    deps,
    sourcemap = True,
    testonly = None,
    visibility = None,
    tags = None,
):
    """Generates CSS "binaries" of direct `css_library()` dependencies.
    
    Each `css_library()` in `deps` gets each of its direct sources compiled into a
    "binary", a new CSS file which bundles all the `@import` dependencies of that source.

    Returns:
        `DefaultInfo`: Contains bundled CSS and sourcemaps.
        `CssImportMapInfo`: Maps importable paths to generated CSS binary files.

    Args:
        name: Name of this target.
        deps: Dependencies of this target which provide `CssInfo` (generally
            `css_library()`).
        sourcemap: Whether to generate sourcemaps (defaults to `True`).
        testonly: https://docs.bazel.build/versions/main/be/common-definitions.html#common-attributes
        visibility: https://docs.bazel.build/versions/main/be/common-definitions.html#common-attributes
        tags: https://docs.bazel.build/versions/main/be/common-definitions.html#common-attributes
    """
    binaries = []
    for (index, dep) in enumerate(deps):
        binary_name = "%s_binary_%s" % (name, index)
        _css_binary(
            name = binary_name,
            sourcemap = sourcemap,
            dep = dep,
            testonly = testonly,
            tags = tags,
        )
        binaries.append(binary_name)

    css_group(
        name = name,
        deps = [":%s" % binary for binary in binaries],
        testonly = testonly,
        visibility = visibility,
        tags = tags,
    )

# It might look like this implementation should accept multiple `css_library()` targets,
# but doing so would be a bad idea. This is because the library is separated into "direct
# sources" and "transitive dependencies" which are fed into `postcss_multi_binary()`. If
# this allowed multiple libraries and same split was done, it would be "all libraries'
# direct sources" and "all libraries' transitive dependencies". This sounds reasonable,
# but would break strict deps. If one library had `@import url("rules_prerender/foo");`
# but forgot to add a dep on `//:foo` yet another library in this binary had a dep on
# `//:foo`, the first would incorrectly compile successfully. As a result, we need a
# separate `postcss_multi_binary()` for each compiled `css_library()`.
def _css_binary(
    name,
    dep,
    sourcemap,
    testonly = None,
    visibility = None,
    tags = None,
):
    """Generates a CSS "binary" for a single `css_library()` dependency.
    
    The `css_library()` dependency gets each of its direct sources compiled into a
    "binary", a new CSS file which bundles all the `@import` dependencies of that source.
    Note that while this macro is called `_css_binary()` in the singular form, if the
    `css_library()` dependency has multiple direct sources, each one will be compiled into
    an independent "binary", meaning multiple binaries can be generated by this macro.

    Returns:
        `DefaultInfo`: Contains bundled CSS and sourcemaps.
        `CssImportMapInfo`: Maps importable paths to generated CSS binary files.

    Args:
        name: Name of this target.
        dep: Dependency of this target which provides `CssInfo` (generally
            `css_library()`).
        sourcemap: Whether to generate sourcemaps.
        testonly: https://docs.bazel.build/versions/main/be/common-definitions.html#common-attributes
        visibility: https://docs.bazel.build/versions/main/be/common-definitions.html#common-attributes
        tags: https://docs.bazel.build/versions/main/be/common-definitions.html#common-attributes
    """
    # Compile the CSS. This only compiles one library, but that library may have many
    # source files, each one should be compiled into its own output, which requires
    # `postcss_multi_binary()` even though `postcss_binary()` sounds like it would be
    # sufficient here.
    parcel_bundle(
        name = name,
        testonly = testonly,
        visibility = visibility,
        tags = tags,
        dep = dep,
    )

def _css_deps_impl(ctx):
    return DefaultInfo(
        files = ctx.attr.dep[CssInfo].transitive_sources,
    )

_css_deps = rule(
    implementation = _css_deps_impl,
    attrs = {
        "dep": attr.label(
            mandatory = True,
            providers = [CssInfo],
        ),
    },
    doc = "Returns transitive CSS sources in `DefaultInfo`.",
)
