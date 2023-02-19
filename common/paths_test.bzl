"""Tests for `paths.bzl`."""

load("@bazel_skylib//lib:partial.bzl", "partial")
load("@bazel_skylib//lib:unittest.bzl", "asserts", "unittest")
load(":paths.bzl", "is_js_file")

visibility("private")

def _is_js_file_impl(ctx):
    env = unittest.begin(ctx)

    asserts.equals(env, True, is_js_file("foo/bar/baz.js"))
    asserts.equals(env, True, is_js_file("foo/bar/baz.mjs"))
    asserts.equals(env, True, is_js_file("foo/bar/baz.cjs"))

    asserts.equals(env, False, is_js_file("foo/bar/baz.ts"))
    asserts.equals(env, False, is_js_file("foo/bar/baz.d.ts"))
    asserts.equals(env, False, is_js_file("foo/bar/baz.test"))

    return unittest.end(env)

_is_js_file_test = unittest.make(_is_js_file_impl)

def paths_test_suite(name):
    unittest.suite(
        name,
        partial.make(_is_js_file_test, size = "small"),
    )
