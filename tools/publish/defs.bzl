load(":npm_publish.bzl", _npm_publish = "npm_publish")

visibility("public")

npm_publish = _npm_publish
