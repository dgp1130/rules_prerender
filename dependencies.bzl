"""Set of rules for loading `rules_prerender` in a WORKSPACE file."""

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("@bazel_tools//tools/build_defs/repo:utils.bzl", "maybe")

def rules_prerender_dependencies():
    """Installs workspace-level dependencies for `rules_prerender`."""
    if "build_bazel_rules_nodejs" not in native.existing_rules():
        fail("`rules_prerender` requires `build_bazel_rules_nodejs` workspace to be installed under that name.")

    maybe(
        http_archive,
        name = "aspect_rules_js",
        sha256 = "3ad6684d744ebbc6592d404cc3aa81d0da634eccb3499f6fd198ae122fa28489",
        strip_prefix = "rules_js-1.19.0",
        url = "https://github.com/aspect-build/rules_js/releases/download/v1.19.0/rules_js-v1.19.0.tar.gz",
    )

    maybe(
        http_archive,
        name = "aspect_rules_rollup",
        sha256 = "2a0c863fa4ca35cc2d49b63637792d38262f71fc0590c76b7946838614c94fda",
        strip_prefix = "rules_rollup-0.13.0",
        url = "https://github.com/aspect-build/rules_rollup/archive/refs/tags/v0.13.0.tar.gz",
    )

    maybe(
        http_archive,
        name = "aspect_rules_ts",
        sha256 = "db77d904284d21121ae63dbaaadfd8c75ff6d21ad229f92038b415c1ad5019cc",
        strip_prefix = "rules_ts-1.3.0",
        url = "https://github.com/aspect-build/rules_ts/releases/download/v1.3.0/rules_ts-v1.3.0.tar.gz",
    )

    maybe(
        http_archive,
        name = "aspect_rules_jasmine",
        sha256 = "089250b6afda54099d7a3bc4e0f0765451356f329d105a32d1a78703edf70320",
        strip_prefix = "rules_jasmine-0.3.0",
        url = "https://github.com/aspect-build/rules_jasmine/archive/refs/tags/v0.3.0.tar.gz",
    )

    maybe(
        http_archive,
        name = "io_bazel_rules_webtesting",
        sha256 = "e9abb7658b6a129740c0b3ef6f5a2370864e102a5ba5ffca2cea565829ed825a",
        urls = ["https://github.com/bazelbuild/rules_webtesting/releases/download/0.3.5/rules_webtesting.tar.gz"],
    )
