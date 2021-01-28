"""Functionality for extracting annotations from a prerendered HTML file."""

def extract_annotations(
    name,
    annotated_page,
    output_page,
    output_metadata,
    testonly = None,
):
    """Extracts annotations from the provided HTML.
    
    Args:
        name: The name of the rule.
        annotated_page: An annotated HTML page to extract from.
        output_page: The file to write the output HTML to. This will be the
            input HTML page except with all annotations removed.
        output_metadata: The file to write the output metadata JSON which is
            generated from the annotations extracted from the input HTML file.
        testonly: See https://docs.bazel.build/versions/master/be/common-definitions.html.
    """
    native.genrule(
        name = name,
        srcs = [annotated_page],
        outs = [
            output_page,
            output_metadata,
        ],
        cmd = """
            $(location //tools/internal:annotation_extractor) \\
                --input-html $(location {annotated_page}) \\
                --output-html $(location {output_html}) \\
                --output-metadata $(location {output_metadata})
        """.format(
            annotated_page = annotated_page,
            output_html = output_page,
            output_metadata = output_metadata,
        ),
        testonly = testonly,
        tools = ["//tools/internal:annotation_extractor"],
    )
