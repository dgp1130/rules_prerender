"""Defines functionality to generate entry points for JS and CSS."""

load("@aspect_rules_js//js:defs.bzl", "js_run_binary")
load("//common:label.bzl", "absolute", "file_path_of")

def script_entry_point(
    name,
    metadata,
    output_entry_point,
    testonly = None,
    visibility = None,
):
    """Generates an entry point for scripts with the given metadata.
    
    Args:
        name: Name of this target.
        metadata: A metadata JSON file containing information about the scripts
            to bundle.
        output_entry_point: Location to write the generated script entry point.
        testonly: https://bazel.build/reference/be/common-definitions#common-attributes
        visibility: https://bazel.build/reference/be/common-definitions#common-attributes
    """
    package_depth = len(native.package_name().split("/")) if native.package_name() != "" else 0
    js_run_binary(
        name = name,
        mnemonic = "GenerateScriptEntryPoint",
        progress_message = "Generating script entry point %{label}",
        srcs = [metadata],
        outs = [output_entry_point],
        tool = Label("//tools/binaries/script_entry_generator"),
        args = [
            "--metadata", file_path_of(absolute(metadata)),
            "--import-depth", str(package_depth),
            "--output", file_path_of(absolute(output_entry_point)),
        ],
        testonly = testonly,
        visibility = visibility,
    )
