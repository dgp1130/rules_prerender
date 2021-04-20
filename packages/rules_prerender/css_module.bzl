load("@bazel_skylib//rules:build_test.bzl", "build_test")
load("@npm//@bazel/postcss:index.bzl", "postcss_binary")
load("@npm//@bazel/typescript:index.bzl", "ts_library")
load("//common:label.bzl", "absolute")
load(":postcss_import_plugin.bzl", IMPORT_PLUGIN_CONFIG = "PLUGIN_CONFIG")
load(":postcss_modules_plugin.bzl", MODULES_PLUGIN_CONFIG = "PLUGIN_CONFIG")

# TODO: bzl_library()
def css_module(name, srcs, testonly = None, visibility = None, deps = []):
    """Compiles the given CSS sources as CSS modules.

    Definition of CSS modules: https://github.com/css-modules/css-modules.

    Rerpresents a "library" of CSS files which can depend on other CSS files or
    be included in a `prerender_*()` target. Note that this rule does not
    actually have any outputs which are considered public API. The only
    supported way of consuming this rule is to depend on it with a
    `prerender_*()` target.
    
    Params:
        name: The name of this target.
        srcs: CSS source files to compile as CSS modules.
        testonly: https://docs.bazel.build/versions/master/be/common-definitions.html#common.testonly:~:text=testonly,-Boolean%3B
        visibility: https://docs.bazel.build/versions/master/be/common-definitions.html#common.visibility:~:text=use.-,visibility
        deps: Other `css_module()` targets depended upon by this target via an
            `@import` in one of the source files.
    
    Outputs:
        `%{name}`: INTERNAL - A `ts_library()` which provides a `default export`
            object that maps each source class name to its locally scoped name.
        `%{name}_modules`: INTERNAL - A `filegroup()` of all the compiled CSS
            module files.
        `%{name}_build_test`: INTERNAL - A test to confirm that all the relevant
            targets build successfully.
    """
    sources = "%s_sources" % name
    module_deps = ["%s_modules" % absolute(dep) for dep in deps]

    # Convert each CSS file into a TypeScript wrapper that exports its classes.
    # TODO: Use `postcss_mutli_binary()` when it supports `additional_outputs`.
    # https://github.com/bazelbuild/rules_postcss/issues/64
    [postcss_binary(
        name = "%s_%s_css_module" % (name, ".".join(src.split(".")[:-1])),
        src = src,
        output_name = _module_name(src),
        additional_outputs = ["%s.ts" % src],
        sourcemap = True,
        plugins = {
            "//tools/internal:postcss_modules_plugin": MODULES_PLUGIN_CONFIG,
        },
        testonly = testonly,
        deps = [
            ":%s" % sources,
            "@npm//css-modules-loader-core",
        ],
    ) for src in srcs]

    # Compile the CSS module TypeScript wrappers.
    ts_library(
        name = name,
        srcs = ["%s.ts" % src for src in srcs],
        testonly = testonly,
        visibility = visibility,
    )

    # Export transitive sources.
    native.filegroup(
        name = sources,
        srcs = srcs + ["%s_sources" % dep for dep in deps],
        testonly = testonly,
        visibility = visibility,
    )

    # Export transitive source files.
    native.filegroup(
        name = "%s_modules" % name,
        srcs = [_module_name(src) for src in srcs] + module_deps,
        testonly = testonly,
        visibility = visibility,
    )

    # TODO: Strict deps check, but don't use `@import` plugin by default, or
    # else styles will be duplicated for each dependency.
    build_test(
        name = "%s_build_test" % name,
        targets = [
            ":%s" % name,
            ":%s_modules" % name,
        ],
    )

def _module_name(src):
    return "%s.module.css" % ".".join(src.split(".")[:-1])
