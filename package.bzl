"""Set of rules for loading `rules_prerender` in a WORKSPACE file."""

load("@npm//@bazel/postcss:package.bzl", "rules_postcss_dependencies")

def rules_prerender_dependencies():
    """Installs Bazel dependencies for `rules_prerender`."""
    rules_postcss_dependencies()
