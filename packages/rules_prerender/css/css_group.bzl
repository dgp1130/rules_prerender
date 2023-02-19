"""Defines `css_group()` to group multiple `css_library()` targets like `filegroup()`."""

load(":css_providers.bzl", "CssImportMapInfo")

visibility(["//packages/rules_prerender/..."])

def _css_group_impl(ctx):
    return [
        DefaultInfo(
            files = depset([], transitive = [dep[DefaultInfo].files
                                             for dep in ctx.attr.deps]),
        ),
        CssImportMapInfo(
            import_map = _merge_import_maps([dep[CssImportMapInfo]
                                             for dep in ctx.attr.deps
                                             if CssImportMapInfo in dep]),
        ),
    ]

css_group = rule(
    implementation = _css_group_impl,
    attrs = {
        "deps": attr.label_list(mandatory = True),
    },
    doc = "Like a `filegroup()`, but for `css_library()` targets.",
)

def _merge_import_maps(css_import_maps):
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
