"""Defines `web_resources_devserver()` functionality."""

load("@npm//@bazel/typescript:index.bzl", "ts_devserver")
load("//common:label.bzl", "absolute")

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
        visibility: See https://docs.bazel.build/versions/master/be/common-definitions.html.
    """
    # Get the workspace-relative path to the resources directory.
    resources_path = absolute(resources)[len("//"):].replace(":", "/")

    # Generate a devserver implementation.
    ts_devserver(
        name = name,
        static_files = [resources],
        additional_root_paths = [resources_path],
        testonly = testonly,
        visibility = visibility,
    )
