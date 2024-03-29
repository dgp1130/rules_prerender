"""Pinned browser versions.

This function is here to make browser repositories work with cross-platform RBE.
Unlike the `rules_webtesting` `browser_repositories`, this function defines
separate repositories for each platform.
"""

load("//tools/browsers/chromium:chromium.bzl", "define_chromium_repositories")
load("//tools/browsers/firefox:firefox.bzl", "define_firefox_repositories")

def browser_repositories():
    """Load pinned `@io_bazel_rules_webtesting` browser versions."""
    define_chromium_repositories()
    define_firefox_repositories()
