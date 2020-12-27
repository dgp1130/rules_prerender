"""Wraps `@bazel/jasmine` tooling for the respository."""

load("@npm//@bazel/jasmine:index.bzl", _jasmine_node_test = "jasmine_node_test")

def jasmine_node_test(**kwargs):
    """Wrapper for the `jasmine_node_test()` rule.
    
    Args:
      **kwargs: Arguments to pass through to the real `jasmine_node_test()`.
    """
    _jasmine_node_test(
        config_file = kwargs.pop("config_file", None) or "//tools:jasmine.json",
        templated_args = kwargs.pop("templated_args", []) + [
            # Fail the test on unhandled rejection.
            "--node_options=--unhandled-rejections=strict",
        ],
        **kwargs
    )
