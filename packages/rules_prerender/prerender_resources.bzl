"""Defines `prerender_resources()` functionality."""

load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_binary")
load("//common:paths.bzl", "is_js_file")
load("//packages/renderer:build_vars.bzl", "RENDERER_RUNTIME_DEPS")
load(":web_resources.bzl", "WebResourceInfo")
load(":css_library.bzl", "CssImportMap")
# TODO: `bzl_library()` deps.

def prerender_resources(
    name,
    entry_point,
    data,
    inline_styles = None,
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
        inline_styles: TODO
        testonly: See https://docs.bazel.build/versions/master/be/common-definitions.html.
        visibility: See https://docs.bazel.build/versions/master/be/common-definitions.html.
    """
    # Validate `entry_point`.
    if "/" not in entry_point or not is_js_file(entry_point):
        fail(("`entry_point` (%s) *must* be a workspace-relative path of the"
                + " format: \"path/to/pkg/file.js\"") % entry_point)

    # Create a binary to execute the runner script.
    binary = "%s_binary" % name
    nodejs_binary(
        name = binary,
        entry_point = "//tools/internal:renderer_js",
        templated_args = ["--bazel_patch_module_resolver"],
        testonly = testonly,
        data = RENDERER_RUNTIME_DEPS + data + [
            "//tools/internal:renderer",
        ],
    )

    # Execute the renderer and place the generated files into a directory.
    _prerender_resources(
        name = name,
        entry_point = entry_point,
        inline_styles = inline_styles,
        renderer = ":%s" % binary,
        testonly = testonly,
        visibility = visibility,
    )

def _prerender_resources_impl(ctx):
    output_dir = ctx.actions.declare_directory(ctx.attr.name)

    args = ctx.actions.args()
    args.add("--entry-point", "%s/%s" % (ctx.workspace_name, ctx.attr.entry_point))
    args.add("--output-dir", output_dir.path)

    if ctx.attr.inline_styles:
        for (import_path, file) in ctx.attr.inline_styles[CssImportMap].import_map.items():
            args.add("--inline-style-import", import_path)
            args.add("--inline-style-path", file.path)

    ctx.actions.run(
        mnemonic = "Prerender",
        progress_message = "Prerendering (%s)" % ctx.label,
        executable = ctx.executable.renderer,
        arguments = [args],
        outputs = [output_dir],
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
        "entry_point": attr.string(mandatory = True),
        "inline_styles": attr.label(providers = [CssImportMap]),
        "renderer": attr.label(
            mandatory = True,
            executable = True,
            cfg = "exec",
        ),
    },
)
