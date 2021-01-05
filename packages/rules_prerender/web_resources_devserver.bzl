"""Defines `web_resources_devserver()` functionality."""

def web_resources_devserver(
    name,
    resources,
    testonly = None,
    visibility = None,
):
    """Generates a devserver which serves the provided `web_resources()` target.

    IMPORTANT NOTE: This server is for **development purposes only**. It has not
    been (and will never be) security reviewed and is not suitable for
    production use.

    Args:
        name: The name of this rule.
        resources: The `web_resources()` target to serve.
        testonly: See https://docs.bazel.build/versions/master/be/common-definitions.html.
        visibility: See https://docs.bazel.build/versions/master/be/common-definitions.html
    """
    template = "//packages/rules_prerender:devserver.tmpl.sh"
    binary = "@npm//http-server/bin:http-server"

    # Generate a shell script that wraps the devserver with the resources
    # directory path compiled-in. This allows users to provide flags without
    # being able to change the served resources directory.
    runner = "%s_runner.sh" % name
    native.genrule(
        name = "%s_genrule" % name,
        srcs = [
            template,
            "%s.sh" % binary,
            resources,
        ],
        outs = [runner],
        cmd = """
            cat "{template}" |
            sed "s,%BINARY%,{binary},g" |
            sed "s,%RESOURCES%,{resources},g" |
            sed "s,%WORKSPACE%,{workspace},g" \\
            > $@
        """.format(
            template = "$(rootpath %s)" % template,
            binary = "$(rootpath %s.sh)" % binary,
            resources = "$(rootpath %s)" % resources,
            workspace = native.repository_name(),
        ),
        testonly = testonly,
    )

    # Generate a binary rule for users to execute the devserver.
    native.sh_binary(
        name = name,
        srcs = [runner],
        data = [
            binary,
            resources,
            "@bazel_tools//tools/bash/runfiles",
        ],
        testonly = testonly,
        visibility = visibility,
    )
