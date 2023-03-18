## Installation

Copy the following into your `WORKSPACE.bazel` file:

```python
load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

http_archive(
    name = "aspect_rules_js",
    sha256 = "00e7b97b696af63812df0ca9e9dbd18579f3edd3ab9a56f227238b8405e4051c",
    strip_prefix = "rules_js-1.23.0",
    url = "https://github.com/aspect-build/rules_js/releases/download/v1.23.0/rules_js-v1.23.0.tar.gz",
)
load("@aspect_rules_js//js:repositories.bzl", "rules_js_dependencies")
rules_js_dependencies()

load("@rules_nodejs//nodejs:repositories.bzl", "nodejs_register_toolchains")
nodejs_register_toolchains(
    name = "nodejs",
    node_version = "18.12.1",
)

load("@aspect_rules_js//npm:npm_import.bzl", "npm_translate_lock")
npm_translate_lock(
    name = "npm",
    pnpm_lock = "//:pnpm-lock.yaml",
    verify_node_modules_ignored = "//:.bazelignore",
    npmrc = "//:.npmrc",
)
load("@npm//:repositories.bzl", "npm_repositories")
npm_repositories()

load("@aspect_bazel_lib//lib:repositories.bzl", "register_jq_toolchains")
register_jq_toolchains()

# This _must_ be named `rules_prerender`, other names are currently unsupported.
http_archive(
    name = "rules_prerender",
    sha256 = "$SHA",
    strip_prefix = "$PREFIX",
    url = "https://github.com/dgp1130/rules_prerender/releases/download/$VERSION/$ARCHIVE",
)
load("@rules_prerender//:dependencies.bzl", "rules_prerender_dependencies")
rules_prerender_dependencies()
load("@rules_prerender//:repositories.bzl", "rules_prerender_repositories")
rules_prerender_repositories()
load(
    "@rules_prerender//:npm_repositories.bzl",
    prerender_npm_repositories = "npm_repositories",
)
prerender_npm_repositories()
```
