"""Set of rules for loading `rules_prerender` in a WORKSPACE file."""

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("@bazel_tools//tools/build_defs/repo:utils.bzl", "maybe")

def rules_prerender_dependencies():
    """Installs workspace-level dependencies for `rules_prerender`."""
    maybe(
        http_archive,
        name = "aspect_rules_js",
        sha256 = "2cfb3875e1231cefd3fada6774f2c0c5a99db0070e0e48ea398acbff7c6c765b",
        strip_prefix = "rules_js-1.42.3",
        url = "https://github.com/aspect-build/rules_js/releases/download/v1.42.3/rules_js-v1.42.3.tar.gz",
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
        sha256 = "f69a6452b129d39d9b05f3dff8b1057185bb195b4daf0cff419988de757c6c31",
        strip_prefix = "rules_ts-2.4.2",
        url = "https://github.com/aspect-build/rules_ts/releases/download/v2.4.2/rules_ts-v2.4.2.tar.gz",
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
