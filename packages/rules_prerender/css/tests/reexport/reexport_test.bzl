"""Tests reexport functionality."""

load("@bazel_skylib//lib:sets.bzl", "sets")
load("@bazel_skylib//lib:unittest.bzl", "analysistest", "asserts")
load("//packages/rules_prerender/css:css_library.bzl", "css_library")
load("//packages/rules_prerender/css:css_providers.bzl", "CssInfo")

visibility("private")

def _reexport_test_impl(ctx):
    env = analysistest.begin(ctx)

    default_info = analysistest.target_under_test(env)[DefaultInfo]
    asserts.set_equals(
        env,
        sets.make([
            "packages/rules_prerender/css/tests/reexport/foo.css",
            "packages/rules_prerender/css/tests/reexport/bar.css",
            "packages/rules_prerender/css/tests/reexport/baz.css",
        ]),
        sets.make([file.short_path for file in default_info.files.to_list()]),
    )

    css_info = analysistest.target_under_test(env)[CssInfo]
    asserts.set_equals(
        env,
        sets.make([
            "packages/rules_prerender/css/tests/reexport/foo.css",
            "packages/rules_prerender/css/tests/reexport/bar.css",
            "packages/rules_prerender/css/tests/reexport/baz.css",
        ]),
        sets.make([file.short_path for file in css_info.direct_sources]),
    )
    asserts.set_equals(
        env,
        sets.make([
            "packages/rules_prerender/css/tests/reexport/foo.css",
            "packages/rules_prerender/css/tests/reexport/bar.css",
            "packages/rules_prerender/css/tests/reexport/baz.css",
            "packages/rules_prerender/css/tests/reexport/dep.css",
        ]),
        sets.make([
            file.short_path
            for file in css_info.transitive_sources.to_list()
        ]),
    )

    return analysistest.end(env)

_reexport_test = analysistest.make(_reexport_test_impl)

def _test_reexport(name):
    css_library(
        name = "styles",
        srcs = ["foo.css", "bar.css"],
    )

    css_library(
        name = "dep",
        srcs = ["dep.css"],
    )

    css_library(
        name = "baz",
        srcs = ["baz.css"],
        deps = [":dep"],
    )

    css_library(
        name = "reexport",
        deps = [":styles", ":baz"],
    )

    _reexport_test(
        name = name,
        target_under_test = ":reexport",
        size = "small",
    )

def _empty_test_impl(ctx):
    env = analysistest.begin(ctx)

    asserts.expect_failure(env, "Expected `srcs` and/or `deps`")

    return analysistest.end(env)

_empty_test = analysistest.make(_empty_test_impl, expect_failure = True)

def _test_empty(name):
    css_library(
        name = "empty",
        tags = ["manual"],
    )

    _empty_test(
        name = name,
        target_under_test = ":empty",
        size = "small",
    )

def reexport_test_suite(name):
    _test_reexport(name = "reexport_test")
    _test_empty(name = "empty_test")

    native.test_suite(
        name = name,
        tests = [
            ":reexport_test",
            ":empty_test",
        ],
    )
