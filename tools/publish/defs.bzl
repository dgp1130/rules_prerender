load(":npm_bundle_deps.bzl", _npm_bundle_deps = "npm_bundle_deps")
load(":npm_publish.bzl", _npm_publish = "npm_publish")

visibility("public")

npm_bundle_deps = _npm_bundle_deps
npm_publish = _npm_publish
