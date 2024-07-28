"""Defines `extract_single_resource()` functionality."""

visibility(["//"])

def extract_single_resource(name = None, resources = None, out = None):
    """Takes the single file in the given resources directory and copies it to `out`.

    This rule accepts a resources directory which contains exactly one file, and
    then copies that file to the `out` parameter. This makes it easier to
    transform a prerendered file. Expected usage is something like:

    ```BUILD
    load(
        "@rules_prerender//:index.bzl",
        "extract_single_resource",
        "prerender_pages_unbundled",
    )

    # Only generates one file at any path.
    prerender_pages_unbundled(
        name = "prerendered",
        src = "prerender.ts",
        # ...
    )

    # ERROR: `:prerendered` is a directory, so the `cp` command fails. Most
    # tools won't work with directories out of the box, meaning custom
    # transformations can be a pain to work with.
    genrule(
        name = "naive_copy",
        srcs = [":prerendered"],
        outs = ["naive.txt"],
        cmd = "cp $< $@",
    )

    # Extract the file from the `:prerendered` directory and call it
    # `my_file.txt`. This is known to Bazel at analysis and is much easier to
    # work with.
    extract_single_resource(
        resources = ":prerendered",
        out = "my_file.txt",
    )

    # Most tools will accept a file label as an input, making this work as
    # expected.
    genrule(
        name = "good_copy",
        srcs = ["my_file.txt"],
        outs = ["good.txt"],
        cmd = "cp $< $@",
    )
    ```

    Throws an error if the input resources directory does not contain *exactly*
    one file. The file can be at any path.

    Params:
        name: The name of this rule.
        resources: The resources directory which contains **exactly** one file
            to copy to `out`. Required.
        out: The name of the generated file extracted from `resources`.
            Requried.
    """

    # Validate inputs.
    if not resources or not out:
        fail("Both the `resources` and `out` attributes are required.")

    # Extract the only file from the input resources directory.
    native.genrule(
        name = name if name else "%s_extract" % out,
        srcs = [resources],
        outs = [out],
        cmd = """
            # Count the files recursively under the source directory.
            readonly FILES=$$(find -L "$<" -type f)
            readonly FILE_COUNT=$$(echo "$${FILES}" | wc -l)

            # Verify that exactly one file was generated. $$FILES is "" if there
            # are no files, however `wc -l` interprets that as one line, so
            # $$FILE_COUNT will never be zero.
            if [ "$${FILES}" = "" ]; then
                echo "Input directory \\`$<\\` should contain exactly one" \\
                    "file, but found none." >&2
                exit 1
            elif [ "$${FILE_COUNT}" -gt "1" ]; then
                echo "Input directory \\`$<\\` should contain exactly one" \\
                    " file, but found multiple:" >&2
                echo "$${FILES}" >&2
                exit 1
            fi

            # Copy the one file to the destination.
            readonly FILE="$${FILES}"
            cp "$${FILE}" "$@"
        """,
    )
