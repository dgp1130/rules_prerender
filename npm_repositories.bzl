load("@jasmine//:npm_repositories.bzl", jasmine_npm_repositories = "npm_repositories")
load("@npm_rules_js//:repositories.bzl", js_npm_repositories = "npm_repositories")
load("@rollup//:npm_repositories.bzl", rollup_npm_repositories = "npm_repositories")

def npm_repositories():
    js_npm_repositories()
    rollup_npm_repositories()
    jasmine_npm_repositories()
