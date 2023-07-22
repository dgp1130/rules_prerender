visibility("private")

VisibilityInfo = provider(fields = {
    "visibility": "Visibility of the target.",
})

def _visibility_aspect_impl(target, ctx):
    return [VisibilityInfo(visibility = ctx.rule.attr.visibility)]

visibility_aspect = aspect(
    implementation = _visibility_aspect_impl,
    # Don't actually walk the depgraph. This aspect should be directly placed on
    # any attributes it needs to process. Since it only needs read direct
    # dependencies there is no need transitive dependency processing.
    attr_aspects = [],
    doc = """
        Returns a `VisibilityInfo` provider with the visibility declaration of
        the target.
    """,
)
