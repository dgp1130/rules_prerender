"""Tests for `paths.bzl`."""

load("@bazel_skylib//lib:partial.bzl", "partial")
load("@bazel_skylib//lib:unittest.bzl", "analysistest", "asserts", "unittest")
load(
    ":paths.bzl",
    "is_js_file",
    "is_ts_file",
    "is_ts_declaration_file",
    "js_output",
)

visibility("private")

def _is_js_file_impl(ctx):
    env = unittest.begin(ctx)

    asserts.equals(env, True, is_js_file("foo/bar/baz.js"))
    asserts.equals(env, True, is_js_file("foo/bar/baz.mjs"))
    asserts.equals(env, True, is_js_file("foo/bar/baz.cjs"))
    asserts.equals(env, True, is_js_file("foo/bar/baz.jsx"))

    asserts.equals(env, False, is_js_file("foo/bar/baz.ts"))
    asserts.equals(env, False, is_js_file("foo/bar/baz.d.ts"))
    asserts.equals(env, False, is_js_file("foo/bar/baz.test"))

    return unittest.end(env)

_is_js_file_test = unittest.make(_is_js_file_impl)

def _is_ts_file_impl(ctx):
    env = unittest.begin(ctx)

    asserts.equals(env, True, is_ts_file("foo/bar/baz.ts"))
    asserts.equals(env, True, is_ts_file("foo/bar/baz.mts"))
    asserts.equals(env, True, is_ts_file("foo/bar/baz.cts"))
    asserts.equals(env, True, is_ts_file("foo/bar/baz.tsx"))

    asserts.equals(env, False, is_ts_file("foo/bar/baz.js"))
    asserts.equals(env, False, is_ts_file("foo/bar/baz.d.ts"))
    asserts.equals(env, False, is_ts_file("foo/bar/baz.test"))

    return unittest.end(env)

_is_ts_file_test = unittest.make(_is_ts_file_impl)

def _is_ts_declaration_file_impl(ctx):
    env = unittest.begin(ctx)

    asserts.equals(env, True, is_ts_declaration_file("foo/bar/baz.d.ts"))
    asserts.equals(env, True, is_ts_declaration_file("foo/bar/baz.d.mts"))
    asserts.equals(env, True, is_ts_declaration_file("foo/bar/baz.d.cts"))
    
    asserts.equals(env, False, is_ts_declaration_file("foo/bar/baz.js"))
    asserts.equals(env, False, is_ts_declaration_file("foo/bar/baz.ts"))
    asserts.equals(env, False, is_ts_declaration_file("foo/bar/baz.test"))

    return unittest.end(env)

_is_ts_declaration_file_test = unittest.make(_is_ts_declaration_file_impl)

def _js_output_impl(ctx):
    env = unittest.begin(ctx)

    asserts.equals(env, "foo/bar/baz.js", js_output("foo/bar/baz.ts"))
    asserts.equals(env, "foo/bar/baz.mjs", js_output("foo/bar/baz.mts"))
    asserts.equals(env, "foo/bar/baz.cjs", js_output("foo/bar/baz.cts"))
    asserts.equals(env, "foo/bar/baz.js", js_output("foo/bar/baz.tsx"))

    return unittest.end(env)

_js_output_test = unittest.make(_js_output_impl)

def _js_output_bad_ext_impl(ctx):
    js_output("foo/bar/baz.test")

_js_output_bad_ext = rule(_js_output_bad_ext_impl)

def _js_output_bad_ext_test_impl(ctx):
    env = analysistest.begin(ctx)

    asserts.expect_failure(
        env, "Expected a `[mc]?ts|tsx` extension, but got `test`.")

    return analysistest.end(env)

_js_output_bad_ext_test = analysistest.make(
    _js_output_bad_ext_test_impl,
    expect_failure = True,
)

def _js_output_no_ext_impl(ctx):
    js_output("foo/bar/baz")

_js_output_no_ext = rule(_js_output_no_ext_impl)

def _js_output_no_ext_test_impl(ctx):
    env = analysistest.begin(ctx)

    asserts.expect_failure(
        env, "No extension on file `foo/bar/baz`.")

    return analysistest.end(env)

_js_output_no_ext_test = analysistest.make(
    _js_output_no_ext_test_impl,
    expect_failure = True,
)

def paths_test_suite(name):
    _js_output_bad_ext(
        name = "%s_bad_ext" % name,
        tags = ["manual"],
    )
    _js_output_bad_ext_test(
        name = "%s_bad_ext_test" % name,
        target_under_test = ":%s_bad_ext" % name,
        size = "small",
    )

    _js_output_no_ext(
        name = "%s_no_ext" % name,
        tags = ["manual"],
    )
    _js_output_no_ext_test(
        name = "%s_no_ext_test" % name,
        target_under_test = ":%s_no_ext" % name,
        size = "small",
    )

    unittest.suite(
        name,
        partial.make(_is_js_file_test, size = "small"),
        partial.make(_is_ts_file_test, size = "small"),
        partial.make(_is_ts_declaration_file_test, size = "small"),
        partial.make(_js_output_test, size = "small"),
    )
