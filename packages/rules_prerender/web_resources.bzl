"""Defines `web_resources()` functionality."""

load("@bazel_skylib//lib:collections.bzl", "collections")
load("//common:label.bzl", "absolute")

_WebResourceInfo = provider(
    "Resources for web projects.",
    fields = ["resources"],
)

def web_resources(
    name,
    entries = {},
    deps = [],
    **kwargs
):
    """Packages a set of resources into a single directory at specified paths.
    
    Args:
        name: The name of this rule.
        entries: A dictionary of URL paths mapped to files. The resulting
            resources directory will have the each file's contents at the
            location of the associated URL path.
        deps: `web_resources()` dependencies to merge into these resources.
        **kwargs: Remaining arguments to pass through to the underlying rule.
    """
    _web_resources_rule(
        name = name,
        # Translate all `entries` labels to absolute syntax for consistency.
        url_file_refs = dict([(url_path, absolute(file_ref))
                              for (url_path, file_ref) in entries.items()]),
        # `entries` may have duplicate labels, must de-deduplicate them.
        file_lbls = collections.uniq(entries.values()),
        deps = deps,
        **kwargs
    )

def _web_resources_impl(ctx):
    # Translate `string` -> `string` dictionary into a `string` -> `label`
    # dictionary by looking up each value in `ctx.attr.file_lbls`.
    url_file_refs = dict([(
        url_path,
        [file_lbl
            for file_lbl in ctx.attr.file_lbls
            if str(file_lbl.label) == file_ref
        ][0],
    ) for (url_path, file_ref) in ctx.attr.url_file_refs.items()])

    args = ctx.actions.args()

    # Add each arg individually instead of using `args.add_all()` so
    # corresponding `--url-path` and `--file-ref` flags are adjacent to each
    # other for easier debugging.
    for (url_path, file_ref) in url_file_refs.items():
        files = file_ref.files.to_list()
        if len(files) != 1:
            fail("Expected only one file from `%s`, but got:\n%s" % (
                file_ref.label,
                "\n".join(["  %s" % file.path for file in files]),
            ))
        ref = files[0]

        args.add("--url-path", url_path)
        args.add("--file-ref", ref)

    # Add dependencies as `--merge-dir` flag.
    deps = [dep[_WebResourceInfo].resources for dep in ctx.attr.deps]
    args.add_all([dep.path for dep in deps], before_each = "--merge-dir")

    dest_dir = ctx.actions.declare_directory(ctx.attr.name)
    args.add("--dest-dir", dest_dir.path)

    # Package all the resources into the new directory.
    ctx.actions.run(
        mnemonic = "ResourcePackager",
        progress_message = "Packing resources",
        executable = ctx.executable._packager,
        arguments = [args],
        inputs = ctx.files.file_lbls + deps,
        outputs = [dest_dir],
    )

    return [
        DefaultInfo(
            files = depset([dest_dir]),
            # Needed to include the directory when used as a `data` input.
            data_runfiles = ctx.runfiles([dest_dir]),
        ),
        _WebResourceInfo(resources = dest_dir),
    ]

_web_resources_rule = rule(
    implementation = _web_resources_impl,
    attrs = {
        "url_file_refs": attr.string_dict(
            doc = """
                Dictionary mapping URL paths to targets exporting a single file.
                This can only be a `string_dict()`, even though we really want a
                `string_to_label_dict()`, so instead the values of this
                dictionary are string, but must be formatted as absolute labels.
                This is merged with `file_lbls` to associate URL paths with
                labels.
            """,
        ),
        "file_lbls": attr.label_list(
            allow_files = True,
            doc = """
                Labels containing all the files to package. Dependencies like
                this must be a `label_list()` which does not allow duplicates.
                So this is a unique set of all labels in the `file_refs`
                attribute.
            """,
        ),
        "deps": attr.label_list(
            providers = [_WebResourceInfo],
            doc = """
                Other `web_resources()` targets to include in the output
                directory.
            """,
        ),
        "_packager": attr.label(
            default = "//packages/resource_packager",
            executable = True,
            cfg = "exec",
        ),
    },
)
