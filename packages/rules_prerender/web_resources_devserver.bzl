"""Defines `web_resources_devserver()` functionality."""

load("@aspect_rules_js//js:defs.bzl", "js_run_devserver")
load("@rules_prerender_npm//:http-server/package_json.bzl", http_server_bin = "bin")
load("//common:label.bzl", "absolute", "file_path_of")

visibility(["//"])

def web_resources_devserver(
    name,
    resources,
    testonly = None,
    visibility = None,
    tags = [],
):
    """Generates a devserver which serves the provided `web_resources()` target.

    IMPORTANT NOTE: This server is for **development purposes only**. It has not
    been (and will never be) security reviewed and is not suitable for
    production use.

    Args:
        name: The name of this rule.
        resources: The `web_resources()` target to serve.
        testonly: See https://docs.bazel.build/versions/master/be/common-definitions.html.
        visibility: See https://docs.bazel.build/versions/master/be/common-definitions.html.
        tags: See https://docs.bazel.build/versions/master/be/common-definitions.html.
    """
    root_dir = file_path_of(absolute(resources))
    disable_cache = "-c-1" # Set cache (`-c`) time to `-1` to disable it.

    # Bake in the `resources` directory as the first argument, so the server can
    # never be run on a different directory.
    baked = "%s_baked_server" % name
    _baked_binary(
        name = baked,
        baked_args = [root_dir, disable_cache],
        # Technically `resources` isn't required here, since it will actually
        # use the one under `js_run_devserver()`, but if you `blaze run`
        # `_baked_server` directly, then it is needed, even if a user should
        # never do that in practice.
        data = [resources],
        binary = Label("//packages/rules_prerender:http_server"),
        testonly = testonly,
    )

    # Expose the devserver using the baked `http-server`.
    js_run_devserver(
        name = name,
        tool = ":%s" % baked,
        # Need `resources` to be listed directly in the devserver, so it is
        # available in the working directory of this binary.
        data = [resources],
        testonly = testonly,
        visibility = visibility,
        tags = tags,
    )

# "Bakes" in arguments for the given binary. By default, arguments given at
# execution time such as `bazel run //:binary -- --some-other-args` will
# _overwrite_ arguments provided via the `args = [...]` attribute.
# `_baked_binary()` "bakes" in these arguments into the binary itself, so any
# arguments provided at execution are _appended_ to baked args, and do not
# replace them.
def _baked_binary(
    name,
    baked_args,
    binary,
    data = None,
    testonly = None,
    visibility = None,
):
    # Generate a shell-script tool which hard-codes the baked args.
    baked_binary_wrapper = "%s.sh" % name
    _baked_args_wrapper(
        name = "%s_wrapper" % name,
        binary = binary,
        baked_args = baked_args,
        output = baked_binary_wrapper,
        testonly = testonly,
    )

    # Generate the binary which will invoke the wrapper shell script.
    native.sh_binary(
        name = name,
        srcs = [baked_binary_wrapper],
        data = data + [binary],
        testonly = testonly,
        visibility = visibility,
    )

def _baked_args_wrapper_impl(ctx):
    # Technically, we should be using Bash runfiles intializtion script to find
    # the binary in runfiles. https://github.com/bazelbuild/bazel/blob/668b0da527a43299f6f6ac49bb5cc37be2265c45/tools/bash/runfiles/runfiles.bash
    # However, that script doesn't work directly because `js_run_devserver()`
    # changes the working directory to the output directory before executing,
    # and while this can be adjusted with `chdir`, it can't be skipped or
    # delayed entirely. As a result, the typical Bash runfiles mechanism doesn't
    # work, and instead we have to go through `${RUNFILES}` provided by
    # `js_run_devserver()`.
    # 
    # `baked_args` are hard-coded in the shell script while any argument passed
    # in at execution are appended afterwards.
    wrapper_script = "${{RUNFILES}}/{binary} {baked_args} $@".format(
        binary = "%s/%s" % (ctx.workspace_name, ctx.executable.binary.short_path),
        baked_args = " ".join(["\"%s\"" % _escape_double_quotes(arg) for arg in ctx.attr.baked_args]),
    ).strip()

    ctx.actions.write(ctx.outputs.output, wrapper_script, True)

_baked_args_wrapper = rule(
    implementation = _baked_args_wrapper_impl,
    attrs = {
        "baked_args": attr.string_list(mandatory = True),
        "binary": attr.label(
            mandatory = True,
            executable = True,
            cfg = "target",
        ),
        "output": attr.output(mandatory = True),
    },
)

def _escape_double_quotes(value):
    return value.replace("\\", "\\\\").replace('"', '\\"')
