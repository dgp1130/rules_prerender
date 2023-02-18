load("@bazel_skylib//lib:unittest.bzl", "asserts", "analysistest")
load("//packages/rules_prerender/css:css_binaries.bzl", "css_binaries")
load("//packages/rules_prerender/css:css_library.bzl", "css_library")
load("//packages/rules_prerender/css:css_providers.bzl", "CssImportMapInfo")

def _import_map_test_impl(ctx):
    env = analysistest.begin(ctx)

    css_import_map = analysistest.target_under_test(env)[CssImportMapInfo]
    import_map = css_import_map.import_map
    asserts.equals(env, 2, len(import_map.items()))

    expected_foo = "packages/rules_prerender/css/tests/import_map/bin_binary_0_parcel/rules_prerender/packages/rules_prerender/css/tests/import_map/foo.css"
    actual_foo = import_map["rules_prerender/packages/rules_prerender/css/tests/import_map/foo.css"].short_path
    asserts.equals(env, expected_foo, actual_foo)

    expected_bar = "packages/rules_prerender/css/tests/import_map/bin_binary_0_parcel/rules_prerender/packages/rules_prerender/css/tests/import_map/bar.css"
    actual_bar = import_map["rules_prerender/packages/rules_prerender/css/tests/import_map/bar.css"].short_path
    asserts.equals(env, expected_bar, actual_bar)

    return analysistest.end(env)

_import_map_test = analysistest.make(_import_map_test_impl)

def _test_import_map(name):
    css_binaries(
        name = "bin",
        deps = [":lib"],
        tags = ["manual"],
    )

    css_library(
        name = "lib",
        srcs = ["foo.css", "bar.css"],
        tags = ["manual"],
    )

    _import_map_test(
        name = name,
        target_under_test = ":bin",
    )

def _import_map_from_different_packages_test_impl(ctx):
    env = analysistest.begin(ctx)

    css_import_map = analysistest.target_under_test(env)[CssImportMapInfo]
    import_map = css_import_map.import_map
    asserts.equals(env, 1, len(import_map.items()))

    # Import path contains `subpackage` because that's what the user would import.
    # But the actual file it points to uses the same name in the `css_binaries()` package.
    expected_lib = "packages/rules_prerender/css/tests/import_map/different_packages_bin_binary_0_parcel/rules_prerender/packages/rules_prerender/css/tests/import_map/subpackage/lib.css"
    actual_lib = import_map["rules_prerender/packages/rules_prerender/css/tests/import_map/subpackage/lib.css"].short_path
    asserts.equals(env, expected_lib, actual_lib)

    return analysistest.end(env)

_import_map_from_different_packages_test = analysistest.make(
    _import_map_from_different_packages_test_impl)

def _test_import_map_from_different_packages(name):
    css_binaries(
        name = "different_packages_bin",
        deps = ["//packages/rules_prerender/css/tests/import_map/subpackage:lib"],
        tags = ["manual"],
    )

    _import_map_from_different_packages_test(
        name = name,
        target_under_test = ":different_packages_bin",
    )

def import_map_test_suite(name):
    _test_import_map(name = "import_map_test")
    _test_import_map_from_different_packages(name = "import_map_from_different_packages_test")

    native.test_suite(
        name = name,
        tests = [
            ":import_map_test",
            ":import_map_from_different_packages_test",
        ],
    )
