"""Defines functionality to generate entry points for JS and CSS."""

def script_entry_point(name, metadata, output_entry_point, testonly = None):
    """Creates a TypeScript entry point for the given metadata JSON.
    
    Args:
        name: The name of the rule.
        metadata: The metadata JSON file to generate an entry point from.
        output_entry_point: The file to write the entry point contents to.
        testonly: See https://docs.bazel.build/versions/master/be/common-definitions.html.
    """
    native.genrule(
        name = name,
        srcs = [metadata],
        outs = [output_entry_point],
        cmd = """
            $(location //tools/internal:script_entry_generator) \\
                --metadata $(location {metadata}) \\
                --output $(location {output})
        """.format(
            metadata = metadata,
            output = output_entry_point,
        ),
        tools = ["//tools/internal:script_entry_generator"],
    )

def _style_entry_point_impl(ctx):
    ctx.actions.run_shell(
        mnemonic = "StyleEntryPoint",
        progress_message = "Generating style entry point",
        command = """
            echo $@ |
            tr " " "\n" |
            sed -E "s,^(.*)$,@import '{workspace}/\\1';,g" \
            > {entry_point}
        """.format(
            workspace = ctx.workspace_name,
            entry_point = ctx.outputs.output_entry_point.path,
        ),
        arguments = [file.short_path for file in ctx.files.styles],
        inputs = [],
        outputs = [ctx.outputs.output_entry_point],
    )

style_entry_point = rule(
    _style_entry_point_impl,
    attrs = {
        "styles": attr.label(mandatory = True),
        "output_entry_point": attr.output(mandatory = True),
    },
)
