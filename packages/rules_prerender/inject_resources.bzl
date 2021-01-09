"""Defines `inject_resources()` functionality."""

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
    _inject_resources_rule(
        name = name,
        input = input,
        scripts = scripts,
        styles = styles,
        output = output or "%s.html" % name,
        **kwargs
    )

def _inject_resources_impl(ctx):
    # Generate configuration JSON from `scripts` and `styles` input.
    script_injections = [{"type": "script", "path": script}
                         for script in ctx.attr.scripts]
    style_injections = [{"type": "style", "path": style.path}
                        for style in ctx.files.styles]
    injections = script_injections + style_injections

    # Write the configuration to a file.
    config = ctx.actions.declare_file("%s_config.json" % ctx.attr.name)
    ctx.actions.write(config, _encode_json(injections))

    # Run the resource injector.
    args = ctx.actions.args()
    args.add("--input", ctx.file.input.path)
    args.add("--config", config.path)
    args.add("--output", ctx.outputs.output.path)
    ctx.actions.run(
        mnemonic = "InjectResources",
        progress_message = "Injecting resources",
        executable = ctx.executable._injector,
        arguments = [args],
        inputs = [ctx.file.input, config] + ctx.files.styles,
        outputs = [ctx.outputs.output],
    )

_inject_resources_rule = rule(
    implementation = _inject_resources_impl,
    attrs = {
        "input": attr.label(
            mandatory = True,
            allow_single_file = True,
        ),
        "scripts": attr.string_list(),
        "styles": attr.label_list(allow_files = True),
        "output": attr.output(mandatory = True),
        "_injector": attr.label(
            default = "//tools/internal:resource_injector",
            executable = True,
            cfg = "exec",
        ),
    },
)

def _encode_json(value):
    """Hack to serialize the given value as JSON."""
    json = struct(value = value).to_json()
    return json[len("{\"value\":"):-len("}")]
