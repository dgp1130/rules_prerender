load(":npm_publish.bzl", _npm_publish = "npm_publish")

visibility("//...")

npm_publish = _npm_publish
