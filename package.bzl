"""Set of rules for loading `rules_prerender` in a WORKSPACE file."""

load("@npm//@bazel/postcss:package.bzl", "rules_postcss_dependencies")
load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

def rules_prerender_dependencies():
    """Installs Bazel dependencies for `rules_prerender`."""
    # Add `rules_webtesting` because it is necessary for `@bazel/concatjs` which
    # is required for `web_resources_devserver()`.
    _maybe(
        http_archive,
        name = "io_bazel_rules_webtesting",
        sha256 = "9bb461d5ef08e850025480bab185fd269242d4e533bca75bfb748001ceb343c3",
        urls = ["https://github.com/bazelbuild/rules_webtesting/releases/download/0.3.3/rules_webtesting.tar.gz"],
    )

    # Install other transitive dependencies.
    rules_postcss_dependencies()

def _maybe(repo_rule, name, **kwargs):
    if name not in native.existing_rules():
        repo_rule(name = name, **kwargs)
