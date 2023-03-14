load("@aspect_rules_js//js:providers.bzl", "JsInfo")
load(
    "//packages/rules_prerender/css:css_providers.bzl",
    "CssInfo",
    "CssImportMapInfo",
)
load("//packages/rules_prerender:web_resources.bzl", "WebResourceInfo")

PrerenderMetadataInfo = provider(fields = {
    "prerender": "TODO",
    "scripts": "TODO",
    "styles": "TODO",
    "styles_import_map": "TODO",
    "resources": "TODO",
})

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
)

def _alias_with_metadata_impl(ctx):
    providers = [ctx.attr.metadata[PrerenderMetadataInfo]]

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
