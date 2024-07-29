"""Entry point for rules related to dependency management."""

load(":prune_dependencies.bzl", _prune_dependencies = "prune_dependencies")

visibility("//...")

prune_dependencies = _prune_dependencies
