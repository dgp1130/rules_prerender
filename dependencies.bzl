"""Set of rules for loading `rules_prerender` in a WORKSPACE file."""

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("@bazel_tools//tools/build_defs/repo:utils.bzl", "maybe")

def rules_prerender_dependencies():
    """Installs workspace-level dependencies for `rules_prerender`."""
    maybe(
        http_archive,
        name = "aspect_rules_js",
        sha256 = "e3e6c3d42491e2938f4239a3d04259a58adc83e21e352346ad4ef62f87e76125",
        strip_prefix = "rules_js-1.30.0",
        url = "https://github.com/aspect-build/rules_js/releases/download/v1.30.0/rules_js-v1.30.0.tar.gz",
    )

    maybe(
        http_archive,
        name = "bazel_features",
        sha256 = "9fcb3d7cbe908772462aaa52f02b857a225910d30daa3c252f670e3af6d8036d",
        strip_prefix = "bazel_features-1.0.0",
        url = "https://github.com/bazel-contrib/bazel_features/releases/download/v1.0.0/bazel_features-v1.0.0.tar.gz",
    )

    maybe(
        http_archive,
        name = "aspect_rules_ts",
        sha256 = "8aabb2055629a7becae2e77ae828950d3581d7fc3602fe0276e6e039b65092cb",
        strip_prefix = "rules_ts-2.0.0",
        url = "https://github.com/aspect-build/rules_ts/releases/download/v2.0.0/rules_ts-v2.0.0.tar.gz",
    )

    maybe(
        http_archive,
        name = "aspect_rules_jasmine",
        sha256 = "4c16ef202d1e53fd880e8ecc9e0796802201ea9c89fa32f52d5d633fff858cac",
        strip_prefix = "rules_jasmine-1.1.1",
        url = "https://github.com/aspect-build/rules_jasmine/releases/download/v1.1.1/rules_jasmine-v1.1.1.tar.gz",
    )

    maybe(
        http_archive,
        name = "io_bazel_rules_webtesting",
        sha256 = "e9abb7658b6a129740c0b3ef6f5a2370864e102a5ba5ffca2cea565829ed825a",
        urls = ["https://github.com/bazelbuild/rules_webtesting/releases/download/0.3.5/rules_webtesting.tar.gz"],
    )
