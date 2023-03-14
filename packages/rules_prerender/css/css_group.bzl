"""Defines `css_group()` to group multiple `css_library()` targets like `filegroup()`."""

load(":css_providers.bzl", "CssImportMapInfo", "CssInfo")

visibility(["//packages/rules_prerender/..."])

def _css_group_impl(ctx):
    return [
        DefaultInfo(
            files = depset([], transitive = [dep[DefaultInfo].files
                                             for dep in ctx.attr.deps]),
        ),
        CssInfo(
            direct_sources = depset([]),
            transitive_sources = depset(
                direct = [],
                transitive = [dep[CssInfo].transitive_sources
                              for dep in ctx.attr.deps
                              if CssInfo in dep],
            ),
        ),
        CssImportMapInfo(
            import_map = merge_import_maps([dep[CssImportMapInfo]
                                             for dep in ctx.attr.deps
                                             if CssImportMapInfo in dep]),
        ),
    ]

css_group = rule(
    implementation = _css_group_impl,
    attrs = {
        # TODO: `providers = [CssInfo, CssImportMapInfo]`?
        "deps": attr.label_list(mandatory = True),
    },
    doc = "Like a `filegroup()`, but for `css_library()` targets.",
)

def merge_import_maps(css_import_maps):
    """Merges a list of `CssImportMapInfo` into a single `CssImportMapInfo`.
    
    Fails the build if the same import path appears as a key in two maps.
    """
    import_map = dict()
    for css_import_map in css_import_maps:
        for (key, value) in css_import_map.import_map.items():
            if key in import_map:
                fail(("Found duplicate CSS import path in `_css_group()`. %s maps to" +
                      " both %s and %s.") % (key, import_map[key].path, value.path))
            import_map[key] = value

    return import_map
