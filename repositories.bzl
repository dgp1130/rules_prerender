load("@aspect_rules_jasmine//jasmine:repositories.bzl", "jasmine_repositories")
load("@aspect_rules_js//js:repositories.bzl", "rules_js_dependencies")
load("@aspect_rules_js//npm:npm_import.bzl", "npm_translate_lock")
load("@aspect_rules_ts//ts:repositories.bzl", "rules_ts_dependencies")

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

    rules_ts_dependencies(ts_version_from = Label("//:package.json"))

    if "jasmine" not in native.existing_rules():
        jasmine_repositories(
            name = "jasmine",
            jasmine_version = "v4.3.0",
        )
