workspace(name = "rules_prerender")

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# Link `@io_bazel_rules_webtesting` to the locally vendored version.
local_repository(
    name = "io_bazel_rules_webtesting",
    path = "third_party/rules_webtesting",
)

# Load `@bazel_skylib`.
http_archive(
    name = "bazel_skylib",
    sha256 = "b8a1527901774180afc798aeb28c4634bdccf19c4d98e7bdd1ce79d1fe9aaad7",
    urls = [
        "https://mirror.bazel.build/github.com/bazelbuild/bazel-skylib/releases/download/1.4.1/bazel-skylib-1.4.1.tar.gz",
        "https://github.com/bazelbuild/bazel-skylib/releases/download/1.4.1/bazel-skylib-1.4.1.tar.gz",
    ],
)
load("@bazel_skylib//:workspace.bzl", "bazel_skylib_workspace")
bazel_skylib_workspace()

# Load `@aspect_bazel_lib`.
http_archive(
    name = "aspect_bazel_lib",
    sha256 = "ee95bbc80f9ca219b93a8cc49fa19a2d4aa8649ddc9024f46abcdd33935753ca",
    strip_prefix = "bazel-lib-1.29.2",
    url = "https://github.com/aspect-build/bazel-lib/releases/download/v1.29.2/bazel-lib-v1.29.2.tar.gz",
)
load(
    "@aspect_bazel_lib//lib:repositories.bzl",
    "aspect_bazel_lib_dependencies",
    "register_jq_toolchains",
)
aspect_bazel_lib_dependencies()
register_jq_toolchains()

# Load `@rules_prerender` dependencies the same way users will.
load("//:dependencies.bzl", "rules_prerender_dependencies")
rules_prerender_dependencies()
load("//:repositories.bzl", "rules_prerender_repositories")
rules_prerender_repositories()
load("//:npm_repositories.bzl", "npm_repositories")
npm_repositories()

# Set the NodeJS version.
load("@rules_nodejs//nodejs:repositories.bzl", "nodejs_register_toolchains")
nodejs_register_toolchains(
    name = "nodejs", # Default name used by most tools.
    use_nvmrc = "//:.nvmrc",
)

######################################################
#
# Copied `@io_bazel_rules_webtesting` workspace setup.
#
######################################################

load("@io_bazel_rules_webtesting//web:repositories.bzl", "web_test_repositories")
web_test_repositories()

http_archive(
    name = "io_bazel_rules_go",
    sha256 = "8e968b5fcea1d2d64071872b12737bbb5514524ee5f0a4f54f5920266c261acb",
    urls = [
        "https://mirror.bazel.build/github.com/bazelbuild/rules_go/releases/download/v0.28.0/rules_go-v0.28.0.zip",
        "https://github.com/bazelbuild/rules_go/releases/download/v0.28.0/rules_go-v0.28.0.zip",
    ],
)
load("@io_bazel_rules_go//go:deps.bzl", "go_rules_dependencies", "go_register_toolchains")
go_rules_dependencies()
go_register_toolchains(version = "1.16.5")

http_archive(
    name = "bazel_gazelle",
    sha256 = "62ca106be173579c0a167deb23358fdfe71ffa1e4cfdddf5582af26520f1c66f",
    urls = [
        "https://mirror.bazel.build/github.com/bazelbuild/bazel-gazelle/releases/download/v0.23.0/bazel-gazelle-v0.23.0.tar.gz",
        "https://github.com/bazelbuild/bazel-gazelle/releases/download/v0.23.0/bazel-gazelle-v0.23.0.tar.gz",
    ],
)
load("@bazel_gazelle//:deps.bzl", "gazelle_dependencies")
gazelle_dependencies()

load(
    "@io_bazel_rules_webtesting//web/versioned:browsers-0.3.3.bzl",
    webtesting_browser_repositories = "browser_repositories",
)
webtesting_browser_repositories(sauce = True)

load("@io_bazel_rules_webtesting//web:go_repositories.bzl", "go_repositories", "go_internal_repositories")
go_repositories()
go_internal_repositories()

load("@io_bazel_rules_webtesting//web:java_repositories.bzl", "java_repositories")
java_repositories()

load("@io_bazel_rules_webtesting//web:py_repositories.bzl", "py_repositories")
py_repositories()

http_archive(
    name = "io_bazel_rules_scala",
    sha256 = "ccf19e8f966022eaaca64da559c6140b23409829cb315f2eff5dc3e757fb6ad8",
    strip_prefix = "rules_scala-e4560ac332e9da731c1e50a76af2579c55836a5c",
    urls = [
        "https://github.com/bazelbuild/rules_scala/archive/e4560ac332e9da731c1e50a76af2579c55836a5c.zip",
    ],
)
load("@io_bazel_rules_scala//:scala_config.bzl", "scala_config")
scala_config()

load("@io_bazel_rules_scala//scala:scala.bzl", "scala_repositories")
scala_repositories()

load("@rules_proto//proto:repositories.bzl", "rules_proto_dependencies", "rules_proto_toolchains")
rules_proto_dependencies()
rules_proto_toolchains()

load("@io_bazel_rules_scala//scala:toolchains.bzl", "scala_register_toolchains")
scala_register_toolchains()

load("@io_bazel_rules_scala//testing:scalatest.bzl", "scalatest_repositories", "scalatest_toolchain")
scalatest_repositories()
scalatest_toolchain()

# Load browser binaries.
load("//tools/browsers:browser_repositories.bzl", "browser_repositories")
browser_repositories()
