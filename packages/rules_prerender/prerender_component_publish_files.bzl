"""Defines `prerender_component_publish_files()`."""

load("//common:label.bzl", "absolute")

def prerender_component_publish_files(
    name,
    dep,
    testonly = None,
    **kwargs,
):
    """Collects all the files in a `prerender_component()` for publishing.
    
    This is useful when publishing a `prerender_component()` to NPM for another
    repository to consume. You probably want to author the component in
    TypeScript but ship it as JavaScript (with `.d.ts` files). This macro takes
    a `prerender_component()` and extracts all the files that need to be
    published. In the NPM package, another `prerender_component()` can consume
    these files and make the component available to users like any other.

    Params:
        name: The name of this target.
        dep: The `prerender_component()` to publish.
        **kwargs: Remaining arguments to pass through to the underlying target.
    
    Outputs:
        %{name}: A `filegroup()` which provides a `DefaultInfo` that includes
            all the files to be published.
    """
    absolute_name = absolute(dep)

    # Collect ES5 JS for prerendering.
    prerender_js = "%s_prerender_js" % name
    native.filegroup(
        name = prerender_js,
        srcs = ["%s_prerender" % absolute_name],
        output_group = "es5_sources",
        testonly = testonly,
    )

    # Collect ES6 JS for scripts.
    scripts_js = "%s_scripts_js" % name
    native.filegroup(
        name = scripts_js,
        srcs = ["%s_scripts" % absolute_name],
        output_group = "es6_sources",
        testonly = testonly,
    )

    # Collect all the files to be published for the component.
    native.filegroup(
        name = name,
        srcs = [
            "%s_prerender" % absolute_name, # prerender `*.d.ts` files.
            ":%s" % prerender_js,
            "%s_scripts" % absolute_name, # script `*.d.ts` files.
            ":%s" % scripts_js,
            "%s_styles" % absolute_name, # style `*.css` files.
        ],
        testonly = testonly,
        **kwargs
    )
