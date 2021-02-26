def _transitive_es6_impl(ctx):
    transitive_es6_sources = ctx.attr.library[struct].transitive_es6_sources
    modules = [source for source in transitive_es6_sources.to_list() if source.short_path.endswith(".mjs")]
    return DefaultInfo(files = depset(modules))

transitive_es6 = rule(
    implementation = _transitive_es6_impl,
    attrs = {
        "library": attr.label(mandatory = True),
    },
)
