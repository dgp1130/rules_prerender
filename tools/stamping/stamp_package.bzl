load("@aspect_bazel_lib//lib:jq.bzl", "jq")
load("@bazel_skylib//rules:write_file.bzl", "write_file")

def stamp_package(
    name,
    package = "package.json",
    default_version = None,
    **kwargs
):
    """Updates `package.json` files with the stamped version.
    
    In unstamped builds, the `package.json` file will be left alone. In stamped
    builds, the `package.json` will be updated to use the stamped version.

    This stamps both the `version` property and all the `rules_prerender` and
    `@rules_prerender/*` dependencies. If a dependency uses `^` or `~`, that
    prefix is retained while the version is replaced with the stamped version.

    Params:
        name: Name of this target.
        package: The file to stamp. Defaults to `package.json`.
        default_version: The version to use when stamping is not enabled.
            If not given, the `package.json` file is left unchanged. This is
            mainly intended for testing purposes.
        **kwargs: Remaining arguments to pass through to the underlying rule.
    """
    package_filter_args = ["--arg", "PACKAGE_FILTER", "\"^rules_prerender|^@rules_prerender/\""]
    default_version_args = ["--arg", "DEFAULT_VERSION", default_version] if default_version else []
    jq(
        name = name,
        srcs = [package],
        filter_file = Label("//tools/stamping:stamp.jq"),
        args = package_filter_args + default_version_args,
        **kwargs
    )
