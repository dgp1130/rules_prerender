"""Defines repositories for the Firefox browser."""

load("//tools/browsers:browser_archive_repo.bzl", "browser_archive")

def define_firefox_repositories():
    """Defines archives for downloading Firefox."""

    browser_archive(
        name = "org_mozilla_firefox_linux_x64",
        licenses = ["reciprocal"],  # MPL 2.0
        sha256 = "dce89cff7286c1bd4dd906fb9123e6136f1a1ecb7a6d674c53566c319cc85c4d",
        # Firefox v128.0
        urls = ["https://ftp.mozilla.org/pub/firefox/releases/128.0/linux-x86_64/en-US/firefox-128.0.tar.bz2"],
        named_files = {"FIREFOX": "firefox/firefox"},
    )

    browser_archive(
        # Firefox has a launcher that conditionally starts x64/arm64
        name = "org_mozilla_firefox_macos",
        licenses = ["reciprocal"],  # MPL 2.0
        sha256 = "d0341bae660b826fdf6a352355f462495b9a64a3a7b0f953ab85025d6ddbda05",
        # Firefox v128.0
        urls = ["https://ftp.mozilla.org/pub/firefox/releases/128.0/mac/en-US/Firefox%20128.0.dmg"],
        named_files = {"FIREFOX": "Firefox.app/Contents/MacOS/firefox"},
    )

    browser_archive(
        name = "org_mozilla_geckodriver_linux_x64",
        licenses = ["reciprocal"],  # MPL 2.0
        sha256 = "79b2e77edd02c0ec890395140d7cdc04a7ff0ec64503e62a0b74f88674ef1313",
        # Geckodriver v0.34.0
        urls = ["https://github.com/mozilla/geckodriver/releases/download/v0.34.0/geckodriver-v0.34.0-linux64.tar.gz"],
        named_files = {"GECKODRIVER": "geckodriver"},
    )

    browser_archive(
        name = "org_mozilla_geckodriver_macos_x64",
        licenses = ["reciprocal"],  # MPL 2.0
        sha256 = "9cec1546585b532959782c8220599aa97c1f99265bb2d75ad00cd56ef98f650c",
        # Geckodriver v0.34.0
        urls = ["https://github.com/mozilla/geckodriver/releases/download/v0.34.0/geckodriver-v0.34.0-macos.tar.gz"],
        named_files = {"GECKODRIVER": "geckodriver"},
    )

    browser_archive(
        name = "org_mozilla_geckodriver_macos_arm64",
        licenses = ["reciprocal"],  # MPL 2.0
        sha256 = "d33232d29d764018d83e7e4e0c25ac274b5548658c605421c4373e64ba81d904",
        # Geckodriver v0.34.0
        urls = ["https://github.com/mozilla/geckodriver/releases/download/v0.34.0/geckodriver-v0.34.0-macos-aarch64.tar.gz"],
        named_files = {"GECKODRIVER": "geckodriver"},
    )
