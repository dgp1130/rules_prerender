"""Tests for `label.bzl`."""

load("@bazel_skylib//lib:partial.bzl", "partial")
load("@bazel_skylib//lib:unittest.bzl", "asserts", "unittest")
load(":label.bzl", "absolute", "file_path_of", "rel_path")

visibility("private")

def _mock_self_repository_name():
    return "@"

def _mock_external_repository_name():
    return "@wksp"

def _mock_package_name():
    return "path/to/some/pkg"

def _mock_root_package_name():
    return ""

def _absolute_given_relative_target_impl(ctx):
    env = unittest.begin(ctx)

    lbl = absolute(
        ":foo",
        repository_name = _mock_self_repository_name,
        package_name = _mock_package_name,
    )
    asserts.equals(env, "@//path/to/some/pkg:foo", str(lbl))

    return unittest.end(env)

_absolute_given_relative_target_test = unittest.make(
    _absolute_given_relative_target_impl)

def _absolute_given_absolute_target_impl(ctx):
    env = unittest.begin(ctx)

    lbl = absolute(
        "//path/to/some/other/pkg:foo",
        repository_name = _mock_self_repository_name,
        package_name = _mock_package_name,
    )
    asserts.equals(env, "@//path/to/some/other/pkg:foo", str(lbl))

    return unittest.end(env)

_absolute_given_absolute_target_test = unittest.make(
    _absolute_given_absolute_target_impl)

def _absolute_given_external_target_impl(ctx):
    env = unittest.begin(ctx)

    lbl = absolute(
        "@wksp//path/to/some/other/pkg:foo",
        repository_name = _mock_self_repository_name,
        package_name = _mock_package_name,
    )
    asserts.equals(env, "@wksp//path/to/some/other/pkg:foo", str(lbl))

    return unittest.end(env)

_absolute_given_external_target_test = unittest.make(
    _absolute_given_external_target_impl)

def _absolute_given_relative_path_in_external_workspace_impl(ctx):
    env = unittest.begin(ctx)

    lbl = absolute(
        ":foo",
        repository_name = _mock_external_repository_name,
        package_name = _mock_package_name,
    )
    asserts.equals(env, "@wksp//path/to/some/pkg:foo", str(lbl))

    return unittest.end(env)

_absolute_given_relative_path_in_external_workspace_test = unittest.make(
    _absolute_given_relative_path_in_external_workspace_impl)

def _absolute_given_absolute_path_in_external_workspace_impl(ctx):
    env = unittest.begin(ctx)

    lbl = absolute(
        "//path/to/some/other/pkg:foo",
        repository_name = _mock_external_repository_name,
        package_name = _mock_package_name,
    )
    asserts.equals(env, "@wksp//path/to/some/other/pkg:foo", str(lbl))

    return unittest.end(env)

_absolute_given_absolute_path_in_external_workspace_test = unittest.make(
    _absolute_given_absolute_path_in_external_workspace_impl)

def _absolute_given_external_shorthand_impl(ctx):
    env = unittest.begin(ctx)

    lbl = absolute(
        "@foo",
        repository_name = _mock_self_repository_name,
        package_name = _mock_package_name,
    )
    asserts.equals(env, "@foo//:foo", str(lbl))

    return unittest.end(env)

_absolute_given_external_shorthand_test = unittest.make(
    _absolute_given_external_shorthand_impl)

def _file_path_of_given_absolute_target_impl(ctx):
    env = unittest.begin(ctx)

    path = file_path_of("//path/to/some/other/pkg:foo")
    asserts.equals(env, "./path/to/some/other/pkg/foo", str(path))

    at_path = file_path_of("@//path/to/some/other/pkg:foo")
    asserts.equals(env, "./path/to/some/other/pkg/foo", str(at_path))

    return unittest.end(env)

_file_path_of_given_absolute_target_test = unittest.make(
    _file_path_of_given_absolute_target_impl)

def _file_path_of_given_external_target_impl(ctx):
    env = unittest.begin(ctx)

    path = file_path_of("@wksp//path/to/some/other/pkg:foo")
    asserts.equals(env, "../wksp/path/to/some/other/pkg/foo", str(path))

    return unittest.end(env)

_file_path_of_given_external_target_test = unittest.make(
    _file_path_of_given_external_target_impl)

def _file_path_of_given_root_package_target_impl(ctx):
    env = unittest.begin(ctx)

    path = file_path_of("//:foo")
    asserts.equals(env, "./foo", str(path))

    at_path = file_path_of("@//:foo")
    asserts.equals(env, "./foo", str(at_path))

    return unittest.end(env)

_file_path_of_given_root_package_target_test = unittest.make(
    _file_path_of_given_root_package_target_impl)

def _file_path_of_given_external_root_package_target_impl(ctx):
    env = unittest.begin(ctx)

    path = file_path_of("@wksp//:foo")
    asserts.equals(env, "../wksp/foo", str(path))

    return unittest.end(env)

_file_path_of_given_external_root_package_target_test = unittest.make(
    _file_path_of_given_external_root_package_target_impl)

def _rel_path_of_absolute_path_impl(ctx):
    env = unittest.begin(ctx)

    rel = rel_path("foo/bar/baz.txt", package_name = _mock_package_name)
    asserts.equals(env, "../../../../foo/bar/baz.txt", rel)

    return unittest.end(env)

_rel_path_of_absolute_path_test = unittest.make(_rel_path_of_absolute_path_impl)

def _rel_path_of_root_package_impl(ctx):
    env = unittest.begin(ctx)

    rel = rel_path("foo/bar/baz.txt", package_name = _mock_root_package_name)
    asserts.equals(env, "./foo/bar/baz.txt", rel)

    return unittest.end(env)

_rel_path_of_root_package_test = unittest.make(_rel_path_of_root_package_impl)

def label_test_suite(name):
    unittest.suite(
        name,
        partial.make(_absolute_given_relative_target_test, size = "small"),
        partial.make(_absolute_given_absolute_target_test, size = "small"),
        partial.make(_absolute_given_external_target_test, size = "small"),
        partial.make(
            _absolute_given_relative_path_in_external_workspace_test,
            size = "small",
        ),
        partial.make(
            _absolute_given_absolute_path_in_external_workspace_test,
            size = "small",
        ),
        partial.make(_absolute_given_external_shorthand_test, size = "small"),
        partial.make(_file_path_of_given_absolute_target_test, size = "small"),
        partial.make(_file_path_of_given_external_target_test, size = "small"),
        partial.make(
            _file_path_of_given_root_package_target_test,
            size = "small",
        ),
        partial.make(
            _file_path_of_given_external_root_package_target_test,
            size = "small",
        ),
        partial.make(_rel_path_of_absolute_path_test, size = "small"),
        partial.make(_rel_path_of_root_package_test, size = "small"),
    )
