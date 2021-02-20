"""Defines `inject_resources()` functionality."""

load(":extract_single_resource.bzl", "extract_single_resource")
load(":multi_inject_resources.bzl", "multi_inject_resources")
load(":web_resources.bzl", "web_resources")

def inject_resources(
    name,
    input,
    scripts = [],
    styles = [],
    output = None,
    **kwargs
):
    """Injects web resources into the given HTML input.

    Args:
        name: The name of this rule.
        input: The HTML file use as a base for injecting resources into.
        scripts: A list of URL paths to inject as `<script />` tags.
        styles: A list of CSS files to inline in `<style />` tags.
        output: The file to write the injected HTML output to. Defualts to
            `%{name}.html`
        **kwargs: Remaining arugments to pass through to the underlying rule.
    """
    # Wrap the input file into a directory.
    input_dir = "%s_input" % name
    web_resources(
        name = input_dir,
        entries = {
            "/index.html": input,
        },
    )

    # Inject resources into all files in the directory (which is just one).
    injected = "%s_inject" % name
    multi_inject_resources(
        name = injected,
        input_dir = ":%s" % input_dir,
        scripts = scripts,
        styles = styles,
    )

    # Extract the one file back out into its own label.
    extract_single_resource(
        name = "%s_extract" % name,
        resources = ":%s" % injected,
        out = output if output else "%s.html" % name,
    )
