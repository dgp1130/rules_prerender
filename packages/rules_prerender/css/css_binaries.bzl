"""Defines `css_binaries()` and related rules."""

load("//tools/binaries/css_bundler:css_bundle.bzl", "css_bundle")
load(":css_group.bzl", "css_group")
load(":css_providers.bzl", "CssInfo")

visibility(["//packages/rules_prerender/..."])

def css_binaries(
    name,
    deps,
    testonly = None,
    visibility = None,
    tags = None,
):
    """Generates CSS "binaries" of direct `css_library()` dependencies.
    
    Each `css_library()` in `deps` gets each of its direct sources compiled into a
    "binary", a new CSS file which bundles all the `@import` dependencies of that source.

    Returns:
        `DefaultInfo`: Contains bundled CSS.
        `CssImportMapInfo`: Maps importable paths to generated CSS binary files.

    Args:
        name: Name of this target.
        deps: Dependencies of this target which provide `CssInfo` (generally
            `css_library()`).
        testonly: https://docs.bazel.build/versions/main/be/common-definitions.html#common-attributes
        visibility: https://docs.bazel.build/versions/main/be/common-definitions.html#common-attributes
        tags: https://docs.bazel.build/versions/main/be/common-definitions.html#common-attributes
    """
    # It might look like this implementation should accept multiple `css_library()`
    # targets, but doing so would be a bad idea. This is because the library is separated
    # into "direct sources" and "transitive dependencies" which are fed into
    # `css_bundle()`. If this allowed multiple libraries and same split was done, it
    # would be "all libraries' direct sources" and "all libraries' transitive
    # dependencies". This sounds reasonable, but would break strict deps. If one library
    # had `@import './foo.css';` but forgot to add a dep on `:foo` yet another library in
    # this binary had a dep on `:foo`, the first would incorrectly compile successfully.
    # As a result, we need a separate `css_bundle()` for each compiled `css_library()`
    # until we get proper strict deps support.
    binaries = []
    for (index, dep) in enumerate(deps):
        binary_name = "%s_binary_%s" % (name, index)
        css_bundle(
            name = binary_name,
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
