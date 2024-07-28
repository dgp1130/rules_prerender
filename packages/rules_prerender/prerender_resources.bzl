"""Defines `prerender_resources()` functionality."""

load("@aspect_rules_js//js:defs.bzl", "js_binary")
load("@bazel_skylib//rules:common_settings.bzl", "BuildSettingInfo")
load("@bazel_skylib//rules:write_file.bzl", "write_file")
load("//common:label.bzl", "file_path_of", "rel_path")
load("//common:paths.bzl", "is_js_file")
load("//packages/rules_prerender/css:css_providers.bzl", "CssImportMapInfo")
load("//tools/binaries/renderer:build_vars.bzl", "RENDERER_RUNTIME_DEPS")
load(":web_resources.bzl", "WebResourceInfo")

visibility(["//"])

def prerender_resources(
        name,
        entry_point,
        data,
        styles = None,
        testonly = None,
        visibility = None,
        debug_target = None):
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
        debug_target: The label to check
            `@rules_prerender//tools/flags:debug_prerender` for. If the flag is
            set to this label, then the renderer binary with open a debugger for
            local debugging. Defaults to this target's label. Useful for
            providing intuitive flag behavior in macros.
    """
    prerender_resources_internal(
        name = name,
        entry_point = entry_point,
        data = data,
        testonly = testonly,
        visibility = visibility,
        debug_target = "//%s:%s" % (native.package_name(), name),
        # Not supported in public API because this would require exposing `css_group()` or
        # `css_binaries()` and is only useful for prerendering HTML pages which should be
        # done with `prerender_pages()`, not `prerender_resources()`.
        styles = None,
    )

def prerender_resources_internal(
        name,
        entry_point,
        data,
        debug_target,
        styles = None,
        testonly = None,
        visibility = None):
    """Internal version of `prerender_resources()` which allows `styles` usage."""

    # Validate `entry_point`.
    if "/" not in entry_point or not is_js_file(entry_point):
        fail(("`entry_point` (%s) *must* be a workspace-relative path of the" +
              " format: \"path/to/pkg/file.js\"") % entry_point)

    # Generate binary entry point.
    binary_entry = "%s_binary_entry.mjs" % name
    write_file(
        name = "%s_binary_entry" % name,
        out = binary_entry,
        content = ["""
import * as rulesPrerender from 'rules_prerender';
import {{ main }} from '{binary_helper}';
import {{ createRenderer }} from '{renderer}';
import * as mod from '{entry_point}';

const render = createRenderer(rulesPrerender, mod, '{entry_point}');
void main(render);
        """.format(
            binary_helper = rel_path(file_path_of(Label("//common:binary"))) + ".mjs",
            renderer = rel_path(file_path_of(Label("//tools/binaries/renderer"))) + ".mjs",
            entry_point = entry_point,
        ).strip()],
        testonly = testonly,
    )

    # Create a binary to execute the runner script.
    binary = "%s_binary" % name
    js_binary(
        name = binary,
        entry_point = ":%s" % binary_entry,
        testonly = testonly,
        data = RENDERER_RUNTIME_DEPS + data + [
            # Use the `rules_prerender` dependency from user-space.
            "//:node_modules/rules_prerender",
            Label("//common:binary"),
            Label("//tools/binaries/renderer"),
        ],
    )

    # Execute the renderer and place the generated files into a directory.
    _prerender_resources(
        name = name,
        styles = styles,
        renderer = ":%s" % binary,
        debug_target = debug_target,
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

    # Set up a debugger if the user specifies it.
    debug_arg = ctx.attr._debug_prerender[BuildSettingInfo].value
    debugging = debug_arg and Label(debug_arg) == Label(ctx.attr.debug_target)
    if debugging:
        print("Debugging %s from %s" % (ctx.label, debug_arg))
        args.add("--node_options=--inspect-brk")

    ctx.actions.run(
        mnemonic = "Prerender",
        progress_message = "Prerendering (%s)" % ctx.label,
        executable = ctx.executable.renderer,
        arguments = [args],
        outputs = [output_dir],
        env = {
            "BAZEL_BINDIR": ctx.bin_dir.path,
        },
        execution_requirements = {} if not debugging else {
            # Don't cache the output of this action. The debugger may have
            # altered execution.
            "no-cache": "1",

            # Don't run this action remotely so it will stay local and we can
            # attach a debugger more easily.
            "no-remote": "1",
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
            cfg = "exec",
        ),
        "debug_target": attr.string(mandatory = True),
        "_debug_prerender": attr.label(
            default = "//tools/flags:debug_prerender",
        ),
    },
)
