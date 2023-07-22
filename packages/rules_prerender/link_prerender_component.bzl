load("@aspect_rules_js//js:providers.bzl", "JsInfo")
load("//packages/rules_prerender/css:css_group.bzl", "css_group")
load("//tools/typescript:defs.bzl", "ts_project")
load(":prerender_metadata.bzl", "alias_with_metadata", "prerender_metadata")
load(":web_resources.bzl", "WebResourceInfo")

visibility(["//"])

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
    metadata = "%s_metadata" % name
    prerender_metadata(
        name = metadata,
        prerender = package,
        scripts = package,
        styles = None,
        resources = None,
        component_check = None,
        visibility = visibility,
        testonly = testonly,
    )

    alias_with_metadata(
        name = "%s_prerender" % name,
        actual = package,
        metadata = metadata,
        visibility = visibility,
        testonly = testonly,
    )

    alias_with_metadata(
        name = "%s_scripts" % name,
        actual = package,
        metadata = metadata,
        visibility = visibility,
        testonly = testonly,
    )

    css_group(
        name = "%s_styles" % name,
        visibility = visibility,
        testonly = testonly,
        deps = [], # Empty for now, styles aren't supported.
    )

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
