"""Defines repository dependencies for `@rules_prerender`."""

load("@aspect_rules_js//js:repositories.bzl", "rules_js_dependencies")
load("@aspect_rules_js//npm:npm_import.bzl", "npm_translate_lock")
load("@aspect_rules_ts//ts:repositories.bzl", "rules_ts_dependencies")
load("@bazel_features//:deps.bzl", "bazel_features_deps")

def rules_prerender_repositories():
    rules_js_dependencies()

    # Install NPM packages from the lockfile.
    # NOTE: We can't name this `@npm` because that name is very likely used by
    # the user's workspace, and we would conflict with that.
    npm_translate_lock(
        name = "rules_prerender_npm",
        pnpm_lock = Label("//:pnpm-lock.yaml"),
        npmrc = Label("//:.npmrc"),
        verify_node_modules_ignored = Label("//:.bazelignore"),
    )

    bazel_features_deps()

    rules_ts_dependencies(ts_version_from = Label("//:package.json"))
