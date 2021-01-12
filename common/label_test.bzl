"""Tests for `label.bzl`."""

load("@bazel_skylib//lib:unittest.bzl", "asserts", "unittest")
load(":label.bzl", "absolute", "file_path_of")

def _mock_self_repository_name():
    return "@"

def _mock_external_repository_name():
    return "@wksp"

def _mock_package_name():
    return "path/to/some/pkg"

def _absolute_given_relative_target_impl(ctx):
    env = unittest.begin(ctx)
    
    lbl = absolute(
        ":foo",
        repository_name = _mock_self_repository_name,
        package_name = _mock_package_name,
    )
    asserts.equals(env, "//path/to/some/pkg:foo", str(lbl))
    
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
    asserts.equals(env, "//path/to/some/other/pkg:foo", str(lbl))
    
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

def _file_path_of_given_absolute_target_impl(ctx):
    env = unittest.begin(ctx)
    
    path = file_path_of("//path/to/some/other/pkg:foo")
    asserts.equals(env, "path/to/some/other/pkg/foo", str(path))
    
    return unittest.end(env)

_file_path_of_given_absolute_target_test = unittest.make(
    _file_path_of_given_absolute_target_impl)

def _file_path_of_given_external_target_impl(ctx):
    env = unittest.begin(ctx)
    
    path = file_path_of("@wksp//path/to/some/other/pkg:foo")
    asserts.equals(env, "wksp/path/to/some/other/pkg/foo", str(path))
    
    return unittest.end(env)

_file_path_of_given_external_target_test = unittest.make(
    _file_path_of_given_external_target_impl)

def _file_path_of_given_root_package_target_impl(ctx):
    env = unittest.begin(ctx)
    
    path = file_path_of("//:foo")
    asserts.equals(env, "foo", str(path))
    
    return unittest.end(env)

_file_path_of_given_root_package_target_test = unittest.make(
    _file_path_of_given_root_package_target_impl)

def _file_path_of_given_external_root_package_target_impl(ctx):
    env = unittest.begin(ctx)
    
    path = file_path_of("@wksp//:foo")
    asserts.equals(env, "wksp/foo", str(path))
    
    return unittest.end(env)

_file_path_of_given_external_root_package_target_test = unittest.make(
    _file_path_of_given_external_root_package_target_impl)

def label_test_suite(name):
    unittest.suite(
        name,
        _absolute_given_relative_target_test,
        _absolute_given_absolute_target_test,
        _absolute_given_external_target_test,
        _absolute_given_relative_path_in_external_workspace_test,
        _absolute_given_absolute_path_in_external_workspace_test,
        _file_path_of_given_absolute_target_test,
        _file_path_of_given_external_target_test,
        _file_path_of_given_root_package_target_test,
        _file_path_of_given_external_root_package_target_test,
    )
