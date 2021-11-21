"""Tools for publishing the repository to NPM."""

def publish_files(name, files = [], testonly = None, **kwargs):
    """Generates a `filegroup()` of files in the Bazel package.

    Encapsulates the set of files in a package which must be published to NPM in
    order to work at runtime. This most commonly includes `*.bzl` files, config
    files, or other tools which need to be used at build time of user code. It
    includes the `BUILD.publish` file as the `BUILD` file which will be
    leveraged by user code.

    This is effectively equivalent to a `filegroup()`, but includes
    `BUILD.publish` (renamed to `BUILD`) implicity.

    Args:
        name: The name of this rule.
        files: Files (other than `BUILD.publish`) to include which will be kept
            in the published NPM package.
        testonly: See https://docs.bazel.build/versions/master/be/common-definitions.html.
        **kwargs:
    """
    if "BUILD.publish" in files:
        fail("BUILD.publish does not need to be listed in `publish_files()`, it"
            + " is implict.")

    # The `BUILD.bazel` file describes building this package within its own
    # repository. The `BUILD.publish` file describes the package within the
    # published NPM directory. Having both of these files would cause a file
    # conflict, however we can have a `BUILD` file, which Bazel will still
    # respect and load if it is the only one present. To make this work, we have
    # a `BUILD.bazel` and a `BUILD.publish` file. The former is the normal file,
    # while the latter gets renamed to `BUILD` and inserted into the published
    # directory, to be used by downstream users at build time.
    native.genrule(
        name = "%s_build_rename" % name,
        srcs = ["BUILD.publish"],
        outs = ["BUILD"],
        cmd = "cp $< $@",
        testonly = testonly,
    )

    _collect_publishable_files(
        name = "%s_deps" % name,
        deps = files,
        testonly = testonly,
    )

    native.filegroup(
        name = name,
        srcs = [
            "BUILD",
            ":%s_deps" % name,
        ],
        testonly = testonly,
        **kwargs
    )

def _collect_publishable_files_impl(ctx):
    default_info_files = [dep[DefaultInfo].files for dep in ctx.attr.deps]
    default_info_runfiles = _merge_all_runfiles(
        ctx,
        [dep[DefaultInfo].default_runfiles for dep in ctx.attr.deps],
    ).files

    return DefaultInfo(
        files = depset([], transitive = default_info_files + [default_info_runfiles]),
    )

_collect_publishable_files = rule(
    implementation = _collect_publishable_files_impl,
    attrs = {
        "deps": attr.label_list(
            mandatory = True,
            allow_files = True,
        ),
    },
    doc = """
        Collects all the transitive files of the given dependencies and returns
        them in `DefaultInfo`.
    """,
)

def _merge_all_runfiles(ctx, runfiles_list):
    result = ctx.runfiles()
    for runfiles in runfiles_list:
        result = result.merge(runfiles)
    return result
