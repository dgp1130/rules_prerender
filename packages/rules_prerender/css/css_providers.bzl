"""Defines providers for CSS rules."""

visibility([
    "//packages/rules_prerender/...",
    "//tools/binaries/css_bundler/...",
])

CssInfo = provider("Information related to CSS compilation.", fields = {
    "direct_sources": "Direct sources of the target.",
    "transitive_sources": "All direct *and* transitive sources of the target.",
})

CssImportMapInfo = provider(
    """
Map which relates an importable path to the actual file path it references
    """.strip(),
    fields = {
        "import_map": """
A `dict[str, str]` where a key is a paths which can be used in a user-authored
import statement (wksp/foo/bar/baz.css) mapped to a value which is the file it
actually refers to (bazel-out/bin/foo/bar/baz.css).

This abstracts away the artifact root from user-authored code and also decouples
the import statement authored from the file actually being imported. The
root-relative paths of both the import statement and the real file path
*usually* align, but not always and should not be assumed to match.
        """.strip(),
    },
)
