load("@aspect_rules_jasmine//jasmine:repositories.bzl", "jasmine_repositories")
load("@aspect_rules_js//js:repositories.bzl", "rules_js_dependencies")
load("@aspect_rules_js//npm:npm_import.bzl", "npm_translate_lock")
load("@aspect_rules_rollup//rollup:dependencies.bzl", "rules_rollup_dependencies")
load("@aspect_rules_rollup//rollup:repositories.bzl", "rollup_repositories")
load("@aspect_rules_ts//ts:repositories.bzl", "rules_ts_dependencies")

def rules_prerender_repositories():
    rules_js_dependencies()
    npm_translate_lock(
        name = "npm",
        pnpm_lock = "@rules_prerender//:pnpm-lock.yaml",
        npmrc = "@rules_prerender//:.npmrc",
    )

    rules_ts_dependencies(ts_version_from = "@rules_prerender//:package.json")

    if "rollup" not in native.existing_rules():
        rules_rollup_dependencies()
        rollup_repositories(name = "rollup")

    if "jasmine" not in native.existing_rules():
        jasmine_repositories(name = "jasmine")
