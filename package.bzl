"""Set of rules for loading `rules_prerender` in a WORKSPACE file."""

load("@npm//@bazel/postcss:package.bzl", "rules_postcss_dependencies")
load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

def rules_prerender_dependencies():
    """Installs Bazel dependencies for `rules_prerender`."""
    rules_postcss_dependencies()

def _maybe(repo_rule, name, **kwargs):
    if name not in native.existing_rules():
        repo_rule(name = name, **kwargs)
