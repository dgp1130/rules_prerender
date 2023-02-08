"""Set of rules for loading `rules_prerender` in a WORKSPACE file."""

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("@bazel_tools//tools/build_defs/repo:utils.bzl", "maybe")
load("@npm//@bazel/postcss:package.bzl", "rules_postcss_dependencies")

def rules_prerender_dependencies():
    """Installs workspace-level dependencies for `rules_prerender`."""
    # TODO(#48): Remove this requirement eventually.
    if "build_bazel_rules_nodejs" not in native.existing_rules():
        fail("`rules_prerender` requires `build_bazel_rules_nodejs` workspace to be installed under that name.")

    # TODO(#48): Remove this dependency.
    rules_postcss_dependencies()

    maybe(
        http_archive,
        name = "aspect_rules_js",
        sha256 = "9f51475dd2f99abb015939b1cf57ab5f15ef36ca6d2a67104450893fd0aa5c8b",
        strip_prefix = "rules_js-1.16.0",
        url = "https://github.com/aspect-build/rules_js/archive/refs/tags/v1.16.0.tar.gz",
    )

    maybe(
        http_archive,
        name = "aspect_rules_rollup",
        sha256 = "e0c1f17fccdeedb40b6864ee0708c8e2a9237b46dd97b596e1ba264483d63a7f",
        strip_prefix = "rules_rollup-0.12.5",
        url = "https://github.com/aspect-build/rules_rollup/archive/refs/tags/v0.12.5.tar.gz",
    )

    maybe(
        http_archive,
        name = "aspect_rules_ts",
        sha256 = "acb20a4e41295d07441fa940c8da9fd02f8637391fd74a14300586a3ee244d59",
        strip_prefix = "rules_ts-1.2.0",
        url = "https://github.com/aspect-build/rules_ts/archive/refs/tags/v1.2.0.tar.gz",
        # TODO(#48): Remove when fix is released by `@aspect_rules_ts`.
        # See: https://github.com/aspect-build/rules_ts/pull/310
        patches = ["//:aspect_rules_ts_issue_284.patch"],
    )

    # TODO(#48): Remove from publicly visible dependencies.
    maybe(
        http_archive,
        name = "aspect_rules_jasmine",
        sha256 = "11797ef81f62121ef367b0d50eba1ce4f8fcb51a0fa2e99e18651b8cbc788c91",
        strip_prefix = "rules_jasmine-0.2.5",
        url = "https://github.com/aspect-build/rules_jasmine/archive/refs/tags/v0.2.5.tar.gz",
    )

    # TODO(#48): Remove from publicly visible dependencies.
    maybe(
        http_archive,
        name = "io_bazel_rules_webtesting",
        sha256 = "e9abb7658b6a129740c0b3ef6f5a2370864e102a5ba5ffca2cea565829ed825a",
        urls = ["https://github.com/bazelbuild/rules_webtesting/releases/download/0.3.5/rules_webtesting.tar.gz"],
    )
