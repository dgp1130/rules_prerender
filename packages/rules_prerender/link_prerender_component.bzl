load("@aspect_rules_js//js:providers.bzl", "JsInfo")
load("//tools:typescript.bzl", "ts_project")
load("//packages/rules_prerender:web_resources.bzl", "WebResourceInfo")

# TODO(#48): Split prerender and scripts files from package.
def link_prerender_component(name, package, visibility = None, testonly = None):
    """Links a `prerender_component()` from a linked NPM package.
    
    This creates a `prerender_component()` target from the given package provided it defines
    the relevant metadata in the package.

    Example usage:

    ```BUILD
    # Link the NPM package of `dep_component`.
    npm_link_all_packages(name = "node_modules")

    # Generate the `prerender_component()` from that package.
    link_prerender_component(
        name = "prerender_components/dep_component",
        package = ":node_modules/dep_component",
    )

    # Use the dependency's component.
    prerender_component(
        name = "my_component",
        # ...
        deps = ["//:prerender_components/dep_component"],
    )
    ```

    Args:
        name: Name of this target.
        package: The linked package from `npm_link_all_packages()` or `npm_link_package()`.
        visibility: See https://bazel.build/reference/be/common-definitions
        testonly: See https://bazel.build/reference/be/common-definitions
    """
    native.alias(
        name = "%s_prerender" % name,
        actual = package,
        visibility = visibility,
        testonly = testonly,
    )

    native.alias(
        name = "%s_prerender_for_test" % name,
        actual = package,
        visibility = visibility,
        testonly = testonly,
    )

    native.alias(
        name = "%s_scripts" % name,
        actual = package,
        visibility = visibility,
        testonly = testonly,
    )

    # TODO(#48): Support styles in `link_prerender_component()`.
    native.filegroup(
        name = "%s_styles" % name,
        srcs = [], # Empty.
        visibility = visibility,
        testonly = testonly,
    )

    # TODO(#48): Support resources in `link_prerender_component()`.
    _empty_web_resources(
        name = "%s_resources" % name,
        visibility = visibility,
        testonly = testonly,
    )

def _empty_web_resources_impl(ctx):
    dir = ctx.actions.declare_directory(ctx.attr.name)

    ctx.actions.run_shell(
        mnemonic = "EmptyResources",
        progress_message = "Creating empty resources directory %{label}",
        command = "", # Directory already exists, don't actually need to create it.
        arguments = [dir.path],
        inputs = [],
        outputs = [dir],
    )

    return WebResourceInfo(transitive_entries = depset([dir]))

_empty_web_resources = rule(
    implementation = _empty_web_resources_impl,
)
