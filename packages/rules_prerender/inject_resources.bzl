"""Defines `inject_resources()` functionality."""

def inject_resources(
    name,
    input,
    scripts,
    output = None,
    testonly = None,
    visibility = None,
):
    """Injects web resources into the given HTML input.

    Outputs:
        %{name}.html: An HTML file identical to the input, except with all the
            defined resources injected into it.
    
    Args:
        name: The name of this rule.
        input: The HTML file use as a base for injecting resources into.
        scripts: A list of URL paths to inject as a `<script />` tag.
        output: The file to write the injected HTML output to. Defualts to
            `%{name}.html`
        testonly: See https://docs.bazel.build/versions/master/be/common-definitions.html.
        visibility: See https://docs.bazel.build/versions/master/be/common-definitions.html.
    """
    output = output or "%s.html" % name

    injections = [{"type": "script", "path": script} for script in scripts]
    
    config = "%s_config.json" % name
    native.genrule(
        name = "%s_config" % name,
        srcs = [],
        outs = [config],
        cmd = """
            echo '%s' > $@
        """ % _encode_json(injections),
        testonly = testonly,
    )

    native.genrule(
        name = name,
        srcs = [input, config],
        outs = [output],
        cmd = """
            $(location //packages/resource_injector) \\
                --input $(location {input}) \\
                --config $(location {config}) \\
                --output $(location {output})
        """.format(
            input = input,
            config = config,
            output = output,
        ),
        tools = ["//packages/resource_injector"],
        testonly = testonly,
        visibility = visibility,
    )

def _encode_json(value):
    """Hack to serialize the given value as JSON."""
    json = struct(value = value).to_json()
    return json[len("{\"value\":"):-len("}")]
