"""Entry point for TypeScript rules."""

load(":ts_project.bzl", _ts_project = "ts_project")

visibility("//...")

ts_project = _ts_project
