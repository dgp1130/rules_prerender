"""Defines `jasmine_node_test()`."""

load("@aspect_bazel_lib//lib:copy_file.bzl", "copy_file")
load("@npm_rules_js//:jasmine/package_json.bzl", jasmine_bin = "bin")

def jasmine_node_test(name, deps, data = [], **kwargs):
    """Wrapper for the `jasmine_node_test()` rule.
    
    Args:
        name: Name of this target.
        data: https://docs.bazel.build/versions/main/be/common-definitions.html#common-attributes
        deps: Targets whose `DefaultInfo` files are executed as Jasmine tests.
        **kwargs: Arguments to pass through to the real `jasmine_node_test()`.
    """
    # Generate a config file for the test.
    config_file = "%s_config.json" % name
    _jasmine_config(
        name = config_file,
        testonly = True,
        deps = deps,
    )

    # Generate the actual test from the `@aspect_rules_js` generated binary for the `jasmine`
    # NPM package.
    jasmine_bin.jasmine_test(
        name = name,
        # Note: These args are not applied to `jasmine_web_test_suite()`.
        # Any changes need to be manually applied to that macro.
        args = ["--config=$(rootpath :%s)" % config_file],
        data = data + deps + [
            ":%s" % config_file,
        ],
        testonly = True,
        **kwargs,
    )

def _jasmine_config_impl(ctx):
    config = ctx.actions.declare_file(ctx.attr.name)

    ctx.actions.write(config, json.encode_indent({
        "spec_dir": "",
        "spec_files": [file.short_path for file in ctx.files.deps
                       if file.extension == "js"],
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
