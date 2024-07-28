"""Entry point for stamping rules."""

load(":stamp_package.bzl", _stamp_package = "stamp_package")

visibility("//...")

stamp_package = _stamp_package
