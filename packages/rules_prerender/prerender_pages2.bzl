"""Defines `prerender_pages()` functionality."""

load(":multi_inject_resources.bzl", "multi_inject_resources")
load(":prerender_pages_unbundled2.bzl", "prerender_pages_unbundled")
load(":scripts_bundle.bzl", "scripts_bundle")
load(":web_resources.bzl", "web_resources")

visibility("public")

def prerender_pages(
    name,
    entry_point,
    prerender = None,
    scripts = None,
    styles = None,
    resources = None,
    bundle_js = True,
    testonly = None,
    visibility = None,
    debug_target = None,
):
    """TODO"""
    # TODO: Assert _something_ provided.

    # Render the HTML page at `%{name}_page.html`.
    prerender_name = "%s_unbundled" % name
    prerender_pages_unbundled(
        name = prerender_name,
        entry_point = entry_point,
        prerender = prerender,
        scripts = scripts,
        styles = styles,
        resources = resources,
        testonly = testonly,
        visibility = visibility,
        debug_target = debug_target or "//%s:%s" % (native.package_name(), name),
    )

    bundle = "%s_bundle" % name
    if bundle_js:
        # Bundle all client-side scripts in a `TreeArtifact` at `%{name}_bundle`.
        scripts_bundle(
            name = bundle,
            entry_points = ":%s_scripts_entries" % prerender_name,
            testonly = testonly,
            deps = [":%s_scripts" % prerender_name],
        )

    # Inject bundled JS and CSS into the HTML.
    injected_dir = "%s_injected" % name
    multi_inject_resources(
        name = injected_dir,
        input_dir = ":%s" % prerender_name,
        bundles = ":%s" % bundle if bundle_js else None,
        styles = ":%s_styles" % prerender_name,
        testonly = testonly,
    )

    # Output a resources directory of the HTML, bundled JavaScript, and any
    # resource dependencies.
    web_resources(
        name = name,
        testonly = testonly,
        visibility = visibility,
        deps = [
            ":%s" % injected_dir,
            ":%s_resources" % prerender_name,
        ],
    )
