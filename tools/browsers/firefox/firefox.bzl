"""Defines repositories for the Firefox browser."""

load("//tools/browsers:browser_archive_repo.bzl", "browser_archive")

def define_firefox_repositories():
    browser_archive(
        name = "org_mozilla_firefox_linux_x64",
        licenses = ["reciprocal"], # MPL 2.0
        sha256 = "3d0f74790fe6ff5e38324222ab0c47e10edb31970ed67c6dd7a1c84e7017d1a5",
        # Firefox v97.0
        urls = ["https://ftp.mozilla.org/pub/firefox/releases/97.0/linux-x86_64/en-US/firefox-97.0.tar.bz2"],
        named_files = {"FIREFOX": "firefox/firefox"},
    )

    browser_archive(
        # Firefox has a launcher that conditionally starts x64/arm64
        name = "org_mozilla_firefox_macos",
        licenses = ["reciprocal"], # MPL 2.0
        sha256 = "c06c4e58179acaf55d05c3be41d0d4cdd68f811a75322a39557d91121aa2ef74",
        # Firefox v97.0
        urls = ["https://ftp.mozilla.org/pub/firefox/releases/97.0/mac/en-US/Firefox%2097.0.dmg"],
        named_files = {"FIREFOX": "Firefox.app/Contents/MacOS/firefox"},
    )

    browser_archive(
        name = "org_mozilla_geckodriver_linux_x64",
        licenses = ["reciprocal"], # MPL 2.0
        sha256 = "7fdd8007d22a6f44caa6929a3d74bbd6a00984d88be50255153671bd201e5493",
        # Geckodriver v0.31.0
        urls = ["https://github.com/mozilla/geckodriver/releases/download/v0.31.0/geckodriver-v0.31.0-linux64.tar.gz"],
        named_files = {"GECKODRIVER": "geckodriver"},
    )

    browser_archive(
        name = "org_mozilla_geckodriver_macos_x64",
        licenses = ["reciprocal"],  # MPL 2.0
        sha256 = "4da5c6effe987e0c9049c69c7018e70a9d79f3c6119657def2cc0c3419f885e6",
        # Geckodriver v0.31.0
        urls = ["https://github.com/mozilla/geckodriver/releases/download/v0.31.0/geckodriver-v0.31.0-macos.tar.gz"],
        named_files = {"GECKODRIVER": "geckodriver"},
    )

    browser_archive(
        name = "org_mozilla_geckodriver_macos_arm64",
        licenses = ["reciprocal"], # MPL 2.0
        sha256 = "bfd3974b313be378087f4e7bc4c90128e67dc042647181b4c4ac302b1b88de7f",
        # Geckodriver v0.31.0
        urls = ["https://github.com/mozilla/geckodriver/releases/download/v0.31.0/geckodriver-v0.31.0-macos-aarch64.tar.gz"],
        named_files = {"GECKODRIVER": "geckodriver"},
    )
