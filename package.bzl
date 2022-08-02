"""Set of rules for loading `rules_prerender` in a WORKSPACE file."""

load("@aspect_rules_js//npm:npm_import.bzl", "npm_translate_lock")
load("@build_bazel_rules_nodejs//:index.bzl", "npm_install")

def rules_prerender_dependencies():
    # Load the `@aspect_rules_js` version of the `@npm` workspace. Named `@npm_rules_js` to avoid
    # conflicting with the existing workspace from `@build_bazel_rules_nodejs`.
    # TODO(#48): Rename to `@npm` once migrated off `@build_bazel_rules_nodejs`.
    npm_translate_lock(
        name = "npm_rules_js",
        pnpm_lock = "@rules_prerender//:pnpm-lock.yaml",
        verify_node_modules_ignored = "@rules_prerender//:.bazelignore",
    )

    # The npm_install rule runs yarn anytime the package.json or package-lock.json file changes.
    # It also extracts any Bazel rules distributed in an npm package.
    npm_install(
        # Name this npm so that Bazel label references look like `@npm//package`.
        name = "npm",
        package_json = "@rules_prerender//:package.json",
        package_lock_json = "@rules_prerender//:package-lock.json",
        # Needed for `rules_postcss` to be able to resolve its NPM dependencies.
        strict_visibility = False,
        # Needed for `rules_postcss`.
        exports_directories_only = False,
    )
