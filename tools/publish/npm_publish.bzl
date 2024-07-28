load("@aspect_bazel_lib//lib:copy_to_bin.bzl", "copy_to_bin")
load("@bazel_skylib//rules:build_test.bzl", "build_test")
load("//common:label.bzl", "absolute", "file_path_of")

visibility("private")

def npm_publish(name, package, npmrc, testonly = None, visibility = None):
    """Publishes the given `npm_package()` to NPM.

    Generates a binary which, when run, publishes the given package to NPM.
    Authentication information should be provided via `_authToken` in the
    provided `.npmrc` file. Also generates a test to make sure the binary builds
    successfully, since this it is very likely nothing else will depend on this.

    Args:
        name: Name of this target.
        package: The `npm_package()` to publish.
        npmrc: The `.npmrc` file containing authentication information.
        testonly: https://bazel.build/reference/be/common-definitions#common-attributes
        visibility: https://bazel.build/reference/be/common-definitions#common-attributes
    """

    # For some reason we need to `copy_to_bin()` for the directory to show up in
    # `sh_binary()` runfiles? TBH, I don't understand why this is necessary.
    package_bin = "%s_package" % name
    copy_to_bin(
        name = package_bin,
        srcs = [package],
        testonly = testonly,
    )

    # Merge the `.npmrc` and package together, then run `npm publish`.
    # Authentication information should be in the `.npmrc`.
    native.sh_binary(
        name = name,
        srcs = [Label("//tools/publish:npm_publish.sh")],
        data = [package_bin, npmrc, "@pnpm"],
        args = [
            "rules_prerender/%s" % _normalize(file_path_of(absolute(package))),
            "rules_prerender/%s" % _normalize(file_path_of(absolute(npmrc))),
            "pnpm/pnpm.sh",
        ],
        deps = ["@bazel_tools//tools/bash/runfiles"],
        testonly = testonly,
        visibility = visibility,
    )

    # Always generate a test so the release process doesn't attempt to run
    # multiple publish binaries only to find that the second one fails to build.
    build_test(
        name = "%s_test" % name,
        targets = [":%s" % name],
    )

# Bash runfiles is very particular about file paths, extra `./` paths are not
# allowed.
def _normalize(path):
    normalized = path.replace("/./", "/")
    if normalized.startswith("./"):
        return normalized[2:]
    return normalized
