"""Defines functionality to generate entry points for JS and CSS."""

load("@aspect_bazel_lib//lib:paths.bzl", "to_output_relative_path")

visibility("private")

def _script_entry_points_impl(ctx):
    output = ctx.actions.declare_directory(ctx.label.name)

    args = ctx.actions.args()
    args.add("--metadata", to_output_relative_path(ctx.file.metadata))
    args.add("--output-dir", to_output_relative_path(output))

    ctx.actions.run(
        mnemonic = "GenerateScriptEntryPoints",
        progress_message = "Generating script entry points %{label}",
        executable = ctx.executable._script_entry_generator,
        arguments = [args],
        inputs = [ctx.file.metadata],
        outputs = [output],
        env = {"BAZEL_BINDIR": ctx.bin_dir.path},
    )

    return DefaultInfo(files = depset([output]))

script_entry_points = rule(
    implementation = _script_entry_points_impl,
    attrs = {
        "metadata": attr.label(
            mandatory = True,
            allow_single_file = True,
            doc = """
                A metadata JSON file containing information about the scripts
                to bundle.
            """
        ),
        "_script_entry_generator": attr.label(
            default = "//tools/binaries/script_entry_generator",
            executable = True,
            cfg = "exec",
        ),
    },
    doc = """
        Generates a `TreeArtifact` at `%{name}` with a `.js` file generated for
        every HTML file with included scripts as defined in the given `metadata`
        file. For example, if the user generates the following HTML files and
        includes the associated JavaScript files:

        ```
        * /index.html - [ path/to/pkg/foo.js, path/to/pkg/baz.js ]
        * /dir/other.html - [ path/to/pkg/bar.js, path/to/pkg/baz.js ]
        ```

        Then `script_entry_points` will generate a `TreeArtifact` with:

        ```
        * /index.js - `import './path/to/pkg/foo.js'; import './path/to/pkg/baz.js';`
        * /dir/other.js - `import './path/to/pkg/bar.js'; import './path/to/pkg/baz.js';`
        ```

        These can serve as entry points for the JavaScript bundles necessary for
        each HTML page.
    """,
)
