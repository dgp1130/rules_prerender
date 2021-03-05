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

def rules_prerender_dev_dependencies():
    _maybe(
        http_archive,
        name = "io_bazel_rules_go",
        # We need https://github.com/bazelbuild/rules_go/commit/109c520465fcb418f2c4be967f3744d959ad66d3 which
        # is not part of any 0.16.x release yet. This commit provides runfile resolve support for Windows.
        urls = ["https://github.com/bazelbuild/rules_go/archive/12a52e9845a5b06a28ffda06d7f2b07ff2320b97.zip"],
        strip_prefix = "rules_go-12a52e9845a5b06a28ffda06d7f2b07ff2320b97",
        sha256 = "5c0a059afe51c744c90ae2b33ac70b9b4f4c514715737e2ec0b5fd297400c10d",
    )

def _maybe(repo_rule, name, **kwargs):
    if name not in native.existing_rules():
        repo_rule(name = name, **kwargs)
