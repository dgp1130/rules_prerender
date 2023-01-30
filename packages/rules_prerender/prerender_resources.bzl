"""Defines `prerender_resources()` functionality."""

load("@aspect_rules_js//js:defs.bzl", "js_binary")
load("//common:label.bzl", "absolute", "file_path_of", "rel_path")
load("//common:paths.bzl", "is_js_file")
load("//packages/renderer:build_vars.bzl", "RENDERER_RUNTIME_DEPS")
load("//packages/rules_prerender/css:css_providers.bzl", "CssImportMapInfo")
load(":web_resources.bzl", "WebResourceInfo")

def prerender_resources(
    name,
    entry_point,
    data,
    styles = None,
    testonly = None,
    visibility = None,
):
    """Renders a directory of resources with the given entry point at build time.

    This invokes the default export function of the given entry point, and
    generates a directory of files with the returned content at their
    corresponding locations.

    The file listed in `entry` must be included in the `data` attribute as a
    CommonJS module with a default export of the type:

    ```
    () => Iterable<PrerenderResource> | Promise<Iterable<PrerenderResource>>
        | AsyncIterable<PrerenderResource>
    ```

    Note: You may want to write this using the `Generator` or `AsyncGenerator`
    types, as they are allowed subtypes and will enable TypeScript to catch some
    foot-guns with `return` and `yield` that come with generators.

    ```typescript
    export default function*(): Generator<PrerenderResource, void, void> {
        // ...
    }

    // OR

    export default async function*():
            AsyncGenerator<PrerenderResource, void, void> {
        // ...
    }
    ```

    Outputs:
        %{name}: A `web_resources()`-compatible target containing all the files
            generated at their corresponding locations.

    Args:
        name: The name of this rule.
        entry_point: The JavaScript entry point to use to execute the given
            tool. This *must* be a workspace-relative path of the format:
            "path/to/pkg/file.js". The JS file referenced *must* be included in
            the `data` dependency. There is no way to reference an entry point
            outside the current workspace. If this is desired, you must copy
            that file into the current workspace and then use the copy as an
            entry point.
        data: See https://docs.bazel.build/versions/master/be/common-definitions.html.
        styles: A `css_group()` of inline styles used by the entry point program.
        testonly: See https://docs.bazel.build/versions/master/be/common-definitions.html.
        visibility: See https://docs.bazel.build/versions/master/be/common-definitions.html.
    """
    prerender_resources_internal(
        name = name,
        entry_point = entry_point,
        data = data,
        testonly = testonly,
        visibility = visibility,
        # Not supported in public API because this would require exposing `css_group()` or
        # `css_binaries()` and is only useful for prerendering HTML pages which should be
        # done with `prerender_pages()`, not `prerender_resources()`.
        styles = None,
    )

def prerender_resources_internal(
    name,
    entry_point,
    data,
    styles = None,
    testonly = None,
    visibility = None,
):
    """Internal version of `prerender_resources()` which allows `styles` usage."""
    # Validate `entry_point`.
    if "/" not in entry_point or not is_js_file(entry_point):
        fail(("`entry_point` (%s) *must* be a workspace-relative path of the"
                + " format: \"path/to/pkg/file.js\"") % entry_point)

    # Generate binary entry point.
    binary_entry = "%s_binary_entry.js" % name
    native.genrule(
        name = "%s_binary_entry" % name,
        srcs = [],
        outs = [binary_entry],
        testonly = testonly,
        cmd = """
            echo "const {{ main }} = require('{binary_helper}');" >> $@
            echo "const {{ createRenderer }} = require('{renderer}');" >> $@
            echo "const mod = require('{entry_point}');" >> $@
            echo "" >> $@
            echo "const render = createRenderer(mod, '{entry_point}');" >> $@
            echo "main(render);" >> $@
        """.format(
            binary_helper = rel_path(file_path_of("//common:binary")),
            renderer = rel_path(file_path_of(absolute("//packages/renderer"))),
            entry_point = entry_point,
        ),
    )

    # Create a binary to execute the runner script.
    binary = "%s_binary" % name
    js_binary(
        name = binary,
        entry_point = ":%s" % binary_entry,
        testonly = testonly,
        data = RENDERER_RUNTIME_DEPS + data + [
            "//common:binary",
            "//tools/internal:renderer",
        ],
    )

    # Execute the renderer and place the generated files into a directory.
    _prerender_resources(
        name = name,
        styles = styles,
        renderer = ":%s" % binary,
        testonly = testonly,
        visibility = visibility,
    )

def _prerender_resources_impl(ctx):
    output_dir = ctx.actions.declare_directory(ctx.attr.name)

    args = ctx.actions.args()
    args.add("--output-dir", output_dir.short_path)
    if ctx.attr.styles:
        import_map = ctx.attr.styles[CssImportMapInfo].import_map
        for (import_path, file) in import_map.items():
            args.add("--inline-style-import", import_path)
            args.add("--inline-style-path", file.short_path)

    ctx.actions.run(
        mnemonic = "Prerender",
        progress_message = "Prerendering (%s)" % ctx.label,
        executable = ctx.executable.renderer,
        arguments = [args],
        outputs = [output_dir],
        env = {
            "BAZEL_BINDIR": ctx.bin_dir.path,
        },
    )

    return [
        DefaultInfo(
            files = depset([output_dir]),
            # Needed to include the directory when used as a `data` input.
            data_runfiles = ctx.runfiles([output_dir]),
        ),
        WebResourceInfo(transitive_entries = depset([output_dir])),
    ]

_prerender_resources = rule(
    implementation = _prerender_resources_impl,
    attrs = {
        "styles": attr.label(providers = [CssImportMapInfo]),
        "renderer": attr.label(
            mandatory = True,
            executable = True,
            cfg = "host", # TODO(#48): Use `exec`.
        ),
    },
)
