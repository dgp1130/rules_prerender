"""Loads NPM repositories for `@rules_prerender`."""

load("@rules_prerender_npm//:repositories.bzl", js_npm_repositories = "npm_repositories")

def npm_repositories():
    js_npm_repositories()
