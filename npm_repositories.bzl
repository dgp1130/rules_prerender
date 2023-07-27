load("@jasmine//:npm_repositories.bzl", jasmine_npm_repositories = "npm_repositories")
load("@rules_prerender_npm//:repositories.bzl", js_npm_repositories = "npm_repositories")

def npm_repositories():
    js_npm_repositories()
    jasmine_npm_repositories()
