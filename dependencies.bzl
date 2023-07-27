"""Set of rules for loading `rules_prerender` in a WORKSPACE file."""

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("@bazel_tools//tools/build_defs/repo:utils.bzl", "maybe")

def rules_prerender_dependencies():
    """Installs workspace-level dependencies for `rules_prerender`."""
    maybe(
        http_archive,
        name = "aspect_rules_js",
        sha256 = "00e7b97b696af63812df0ca9e9dbd18579f3edd3ab9a56f227238b8405e4051c",
        strip_prefix = "rules_js-1.23.0",
        url = "https://github.com/aspect-build/rules_js/releases/download/v1.23.0/rules_js-v1.23.0.tar.gz",
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
        sha256 = "b3b2ff30ed222db653092d8280e0b62a4d54c5e65c598df09a0a1d7aae78fc8f",
        strip_prefix = "rules_jasmine-0.3.1",
        url = "https://github.com/aspect-build/rules_jasmine/releases/download/v0.3.1/rules_jasmine-v0.3.1.tar.gz",
        patches = ["@rules_prerender//tools/patches:aspect_rules_jasmine-esm.patch"],
    )

    maybe(
        http_archive,
        name = "io_bazel_rules_webtesting",
        sha256 = "e9abb7658b6a129740c0b3ef6f5a2370864e102a5ba5ffca2cea565829ed825a",
        urls = ["https://github.com/bazelbuild/rules_webtesting/releases/download/0.3.5/rules_webtesting.tar.gz"],
    )
