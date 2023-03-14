load("@aspect_rules_js//js:providers.bzl", "JsInfo")
load(
    "//packages/rules_prerender/css:css_providers.bzl",
    "CssInfo",
    "CssImportMapInfo",
)
load("//packages/rules_prerender:web_resources.bzl", "WebResourceInfo")

PrerenderMetadataInfo = provider(
    "Holds all the providers for each component \"slice\".",
    fields = {
        "prerender": "The JSInfo of the prerender target.",
        "scripts": "The JSInfo of the scripts target.",
        "styles": "The CssInfo of the styles target.",
        "styles_import_map": "The CssImportMapInfo of the styles target.",
        "resources": "The WebResourceInfo of the resources target.",
    },
)

def _prerender_metadata_impl(ctx):
    return PrerenderMetadataInfo(
        prerender = _safe_get(ctx.attr.prerender, JsInfo),
        scripts = _safe_get(ctx.attr.scripts, JsInfo),
        styles = _safe_get(ctx.attr.styles, CssInfo),
        styles_import_map = _safe_get(ctx.attr.styles_import_map, CssImportMapInfo),
        resources = _safe_get(ctx.attr.resources, WebResourceInfo),
    )

prerender_metadata = rule(
    implementation = _prerender_metadata_impl,
    attrs = {
        "prerender": attr.label(
            mandatory = True,
            providers = [JsInfo],
        ),
        "scripts": attr.label(providers = [JsInfo]),
        "styles": attr.label(providers = [CssInfo]),
        "styles_import_map": attr.label(providers = [CssImportMapInfo]),
        "resources": attr.label(providers = [WebResourceInfo]),
    },
    doc = """
        Collects all the various "slices" of a component together into a single
        target and returns a `PrerenderMetadataInfo` linking to all their
        providers.
    """,
)

def _alias_with_metadata_impl(ctx):
    # Re-export the metadata provider.
    providers = [ctx.attr.metadata[PrerenderMetadataInfo]]

    # Re-export all additional known providers from the actual target.
    providers.extend(_safe_get_all(ctx.attr.actual, [
        DefaultInfo,
        JsInfo,
        CssInfo,
        CssImportMapInfo,
        WebResourceInfo,
    ]))

    return providers

alias_with_metadata = rule(
    implementation = _alias_with_metadata_impl,
    attrs = {
        "metadata": attr.label(
            mandatory = True,
            providers = [PrerenderMetadataInfo],
        ),
        "actual": attr.label(
            mandatory = True,
        ),
    },
    doc = """
        Creates an alias to the given `actual` target additionally providing the
        `PrerenderMetadataInfo` from the `metadata` target.
    """,
)

def _safe_get(target, provider):
    if target and provider in target: return target[provider]

    return None

def _safe_get_all(target, providers):
    output = []

    for provider in providers:
        if provider in target:
            output.append(target[provider])

    return output
