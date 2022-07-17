"""Defines functionality to generate entry points for JS and CSS."""

def script_entry_point(name, metadata, output_entry_point, **kwargs):
    """Creates a TypeScript entry point for the given metadata JSON.
    
    Args:
        name: The name of the rule.
        metadata: The metadata JSON file to generate an entry point from.
        output_entry_point: The file to write the entry point contents to.
        **kwargs: Remaining arguments to pass through to the underlying rule.
    """
    package_depth = len(native.package_name().split("/")) if native.package_name() != "" else 0
    native.genrule(
        name = name,
        srcs = [metadata],
        outs = [output_entry_point],
        cmd = """
            $(location //tools/internal:script_entry_generator) \\
                --metadata $(location {metadata}) \\
                --import-depth {import_depth} \\
                --output $(location {output})
        """.format(
            metadata = metadata,
            import_depth = package_depth,
            output = output_entry_point,
        ),
        tools = ["//tools/internal:script_entry_generator"],
        **kwargs
    )
