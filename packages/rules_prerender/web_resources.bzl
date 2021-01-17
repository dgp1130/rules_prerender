"""Defines `web_resources()` functionality."""

load("@bazel_skylib//lib:collections.bzl", "collections")
load("//common:label.bzl", "absolute")

_WebResourceInfo = provider(
    "Resources for web projects.",
    fields = ["transitive_entries"],
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
    """Implements the `web_resources()` rule.

    `web_resources()` simply outputs a directory at `ctx.attr.name` which
    contains all the files given to `entries` at their associated file paths. It
    also merges this directory will all transitive dependencies.
    
    This is implemented with two directories, one (the `entries` directory)
    which includes **only** files that were explicitly listed as `entries` and
    no dependencies. A second (the `merge` directory), merges the `entries`
    directory of this target with the `entries` directories of all transitive
    dependencies. This allows us to support a "triangle" pattern, whereby:

    A
    |
    +---+
    |   |
    v   |
    B   v
    |   |
    v   |
    +---+
    |
    v
    C

    In this case, C transitively depends on A via B, but also directly depends
    on A. If we simply generated a single `merge` directory for each target,
    entries from A would be duplicated in B, and then cause a merge conflict in
    C. Having two directories works around this problem, because any given
    `merge` directory is created by merging transitive `entries` directory, so C
    would attempt to merge `entries` of B with `entries` of A, which should
    never have a conflict (if they did, it's a real conflict).
    """
    # Translate `string` -> `string` dictionary into a `string` -> `label`
    # dictionary by looking up each value in `ctx.attr.file_lbls`.
    url_file_refs = dict([(
        url_path,
        [file_lbl
            for file_lbl in ctx.attr.file_lbls
            if str(file_lbl.label) == file_ref
        ][0],
    ) for (url_path, file_ref) in ctx.attr.url_file_refs.items()])

    entries_args = ctx.actions.args()

    # Add each arg individually instead of using `entries_args.add_all()` so
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

        entries_args.add("--url-path", url_path)
        entries_args.add("--file-ref", ref)

    # Package all `entries` resources into a new directory.
    res_dir = ctx.actions.declare_directory("%s_entries" % ctx.attr.name)
    entries_args.add("--dest-dir", res_dir.path)
    ctx.actions.run(
        mnemonic = "ResourcePackager",
        progress_message = "Packing entries",
        executable = ctx.executable._packager,
        arguments = [entries_args],
        inputs = ctx.files.file_lbls,
        outputs = [res_dir],
    )

    dest_dir = ctx.actions.declare_directory(ctx.attr.name)
    merge_args = ctx.actions.args()

    # Enumerate the `entries` directory for all transitive dependencies and
    # deduplicate them.
    transitive_resources = [dep[_WebResourceInfo].transitive_entries
                            for dep in ctx.attr.deps]
    transitive_entries_dirs = collections.uniq(
        [dir for depset in transitive_resources for dir in depset.to_list()]
    )

    # Merge all trasitive dependencies `entries` directory.
    merge_args.add("--merge-dir", res_dir.path)
    merge_args.add_all(
        [dep.path for dep in transitive_entries_dirs],
        before_each = "--merge-dir",
    )
    merge_args.add("--dest-dir", dest_dir.path)

    # Merge the `entries` directories of all transitive dependencies into a
    # single directory.
    ctx.actions.run(
        mnemonic = "ResourceMerger",
        progress_message = "Merging resources",
        executable = ctx.executable._packager,
        arguments = [merge_args],
        inputs = [res_dir] + transitive_entries_dirs,
        outputs = [dest_dir],
    )

    return [
        DefaultInfo(
            files = depset([dest_dir]),
            # Needed to include the directory when used as a `data` input.
            data_runfiles = ctx.runfiles([dest_dir]),
        ),
        _WebResourceInfo(
            transitive_entries = depset(
                [res_dir],
                transitive = transitive_resources,
            ),
        ),
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
            default = "//tools/internal:resource_packager",
            executable = True,
            cfg = "exec",
        ),
    },
)
