"""Defines `web_resources_devserver()` functionality."""

load("@npm//@bazel/typescript:index.bzl", "ts_devserver")
load("//common:label.bzl", "absolute")

def web_resources_devserver(name, resources, **kwargs):
    """Generates a devserver which serves the provided `web_resources()` target.

    IMPORTANT NOTE: This server is for **development purposes only**. It has not
    been (and will never be) security reviewed and is not suitable for
    production use.

    Args:
        name: The name of this rule.
        resources: The `web_resources()` target to serve.
        **kwargs: Remaining arguments to pass through to the underlying rule.
    """
    # Get the workspace-relative path to the resources directory.
    resources_path = absolute(resources)[len("//"):].replace(":", "/")

    # Generate a devserver implementation.
    ts_devserver(
        name = name,
        static_files = [resources],
        additional_root_paths = [resources_path],
    )
