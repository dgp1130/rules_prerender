load("@bazel_skylib//lib:new_sets.bzl", "sets")
load("@bazel_skylib//lib:unittest.bzl", "asserts", "analysistest")
load("//packages/rules_prerender/css:css_binaries.bzl", "css_binaries")
load("//packages/rules_prerender/css:css_group.bzl", "css_group")
load("//packages/rules_prerender/css:css_library.bzl", "css_library")
load("//packages/rules_prerender/css:css_providers.bzl", "CssImportMapInfo")

def _css_group_test_impl(ctx):
    env = analysistest.begin(ctx)

    # Verify that `css_group()` re-exports `DefaultInfo`.
    default_info = analysistest.target_under_test(env)[DefaultInfo]
    expected_files = sets.make([
        "packages/rules_prerender/css/tests/group/bin1_binary_0/rules_prerender/packages/rules_prerender/css/tests/group/lib1.css",
        "packages/rules_prerender/css/tests/group/bin2_binary_0/rules_prerender/packages/rules_prerender/css/tests/group/lib2.css",
    ])
    actual_files = sets.make([file.short_path for file in default_info.files.to_list()])
    asserts.new_set_equals(env, expected_files, actual_files)

    # Verify that `css_group()` merges `CssImportMapInfo`s correctly.
    css_import_map = analysistest.target_under_test(env)[CssImportMapInfo]
    import_map = css_import_map.import_map
    asserts.equals(env, 2, len(import_map.items()))

    expected_lib1 = "packages/rules_prerender/css/tests/group/bin1_binary_0/rules_prerender/packages/rules_prerender/css/tests/group/lib1.css"
    actual_lib1 = import_map["rules_prerender/packages/rules_prerender/css/tests/group/lib1.css"].short_path
    asserts.equals(env, expected_lib1, actual_lib1)

    expected_lib2 = "packages/rules_prerender/css/tests/group/bin2_binary_0/rules_prerender/packages/rules_prerender/css/tests/group/lib2.css"
    actual_lib2 = import_map["rules_prerender/packages/rules_prerender/css/tests/group/lib2.css"].short_path
    asserts.equals(env, expected_lib2, actual_lib2)

    return analysistest.end(env)

_css_group_test = analysistest.make(_css_group_test_impl)

def _test_css_group(name):
    css_binaries(
        name = "bin1",
        deps = [":lib1"],
        tags = ["manual"],
    )

    css_library(
        name = "lib1",
        srcs = ["lib1.css"],
        tags = ["manual"],
    )

    css_binaries(
        name = "bin2",
        deps = [":lib2"],
        tags = ["manual"],
    )

    css_library(
        name = "lib2",
        srcs = ["lib2.css"],
        deps = [":lib1"], # `css_group()` should be fine with this dep.
        tags = ["manual"],
    )

    css_group(
        name = "group",
        deps = [":bin1", ":bin2"],
        tags = ["manual"],
    )

    _css_group_test(
        name = name,
        target_under_test = ":group",
    )

def _css_group_fails_with_conflicting_maps_test_impl(ctx):
    env = analysistest.begin(ctx)

    asserts.expect_failure(env, "Found duplicate CSS import path in `_css_group()`.")
    # Look for conflicting import path.
    asserts.expect_failure(env,
        "rules_prerender/packages/rules_prerender/css/tests/group/conflicting_lib.css")
    # Look for conflicting file paths.
    asserts.expect_failure(env,
        "packages/rules_prerender/css/tests/group/conflicting_bin1_binary_0/rules_prerender/packages/rules_prerender/css/tests/group/conflicting_lib.css")
    asserts.expect_failure(env,
        "packages/rules_prerender/css/tests/group/conflicting_bin2_binary_0/rules_prerender/packages/rules_prerender/css/tests/group/conflicting_lib.css")

    return analysistest.end(env)

_css_group_fails_with_conflicting_maps_test = analysistest.make(
    _css_group_fails_with_conflicting_maps_test_impl,
    expect_failure = True,
)

def _test_css_group_fails_with_conflicting_maps(name):
    css_library(
        name = "conflicting_lib",
        srcs = ["conflicting_lib.css"],
        tags = ["manual"],
    )

    # Generates conflicting import maps which points `conflicting_lib.css` to both
    # bundled CSS files under `conflicting_bin1/` _and_ `conflicting_bin2/`.
    css_binaries(
        name = "conflicting_bin1",
        deps = [":conflicting_lib"],
        tags = ["manual"],
    )
    css_binaries(
        name = "conflicting_bin2",
        deps = [":conflicting_lib"],
        tags = ["manual"],
    )

    # Should try and fail to merge import maps because they both map
    # `conflicting_lib.css` to two different locations.
    css_group(
        name = "conflicting_group",
        deps = [
            ":conflicting_bin1",
            ":conflicting_bin2",
        ],
        tags = ["manual"],
    )

    _css_group_fails_with_conflicting_maps_test(
        name = name,
        target_under_test = ":conflicting_group",
    )

def group_test_suite(name):
    _test_css_group(name = "css_group_test")
    _test_css_group_fails_with_conflicting_maps(name = "css_group_fails_with_conflicting_maps_test")

    native.test_suite(
        name = name,
        tests = [
            ":css_group_test",
            ":css_group_fails_with_conflicting_maps_test",
        ],
    )
