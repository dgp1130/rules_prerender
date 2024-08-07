"""Defines `jasmine_node_test()`."""

load("@aspect_rules_jasmine//jasmine:defs.bzl", "jasmine_test")
load("//common:paths.bzl", "is_js_file")

visibility("private")

def jasmine_node_test(name, deps, data = [], size = "small", **kwargs):
    """Wrapper for the `jasmine_node_test()` rule.

    Args:
        name: Name of this target.
        data: https://docs.bazel.build/versions/main/be/common-definitions.html#common-attributes
        size: Size of the test.
        deps: Targets whose `DefaultInfo` files are executed as Jasmine tests.
        **kwargs: Arguments to pass through to the real `jasmine_test()`.
    """

    # Generate a config file for the test.
    config_file = "%s_config.json" % name
    _jasmine_config(
        name = config_file,
        testonly = True,
        deps = deps,
    )

    jasmine_test(
        name = name,
        config = config_file,
        node_modules = "//:node_modules",
        jasmine_reporters = False,
        data = data + deps + [
            ":%s" % config_file,
        ],
        testonly = True,
        size = size,
        **kwargs
    )

def _jasmine_config_impl(ctx):
    config = ctx.actions.declare_file(ctx.attr.name)

    ctx.actions.write(config, json.encode_indent({
        "spec_dir": "",
        "spec_files": [
            file.short_path
            for file in ctx.files.deps
            if is_js_file(file.path)
        ],
        "failSpecWithNoExpectations": True,
    }))

    return DefaultInfo(files = depset([config]))

_jasmine_config = rule(
    implementation = _jasmine_config_impl,
    attrs = {
        "deps": attr.label_list(mandatory = True),
    },
    doc = """
        Generates a JSON file with the same name as the rule which executes direct
        dependencies as tests.
    """,
)
