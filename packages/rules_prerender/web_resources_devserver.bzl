"""Defines `web_resources_devserver()` functionality."""

load("@npm//@bazel/concatjs:index.bzl", "concatjs_devserver")
load("//common:label.bzl", "absolute", "file_path_of")

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
    # Generate a devserver implementation.
    concatjs_devserver(
        name = name,
        static_files = [resources],
        # Workspace name is required, but there is no way to look that up in Starlark macro.
        # However, `__main__` seems to work as the default workspace name, even though this
        # repository has a different workspace name.
        # See: https://github.com/bazelbuild/bazel/issues/4092#issuecomment-869091443
        additional_root_paths = ["__main__/%s" % file_path_of(absolute(resources))],
        testonly = testonly,
        visibility = visibility,
        tags = tags,
    )
