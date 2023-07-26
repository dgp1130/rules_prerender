"""Set of rules for loading `rules_prerender` in a WORKSPACE file."""

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("@bazel_tools//tools/build_defs/repo:utils.bzl", "maybe")

def rules_prerender_dependencies():
    """Installs workspace-level dependencies for `rules_prerender`."""
    maybe(
        http_archive,
        name = "aspect_rules_js",
        sha256 = "124ed29fb0b3d0cba5b44f8f8e07897cf61b34e35e33b1f83d1a943dfd91b193",
        strip_prefix = "rules_js-1.24.0",
        url = "https://github.com/aspect-build/rules_js/releases/download/v1.24.0/rules_js-v1.24.0.tar.gz",
    )

    maybe(
        http_archive,
        name = "aspect_rules_ts",
        sha256 = "58b6c0ad158fc42883dafa157f1a25cddd65bcd788a772620192ac9ceefa0d78",
        strip_prefix = "rules_ts-1.3.2",
        url = "https://github.com/aspect-build/rules_ts/releases/download/v1.3.2/rules_ts-v1.3.2.tar.gz",
    )

    maybe(
        http_archive,
        name = "aspect_rules_jasmine",
        sha256 = "5b8a9659221f2050012fb93c230ab5a5029b0b9d8aaa63ec9f1469e82a6c977e",
        strip_prefix = "rules_jasmine-0.4.0",
        url = "https://github.com/aspect-build/rules_jasmine/releases/download/v0.4.0/rules_jasmine-v0.4.0.tar.gz",
    )

    maybe(
        http_archive,
        name = "io_bazel_rules_webtesting",
        sha256 = "e9abb7658b6a129740c0b3ef6f5a2370864e102a5ba5ffca2cea565829ed825a",
        urls = ["https://github.com/bazelbuild/rules_webtesting/releases/download/0.3.5/rules_webtesting.tar.gz"],
    )
