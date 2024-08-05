"""Defines repositories for the Chromium browser."""

load("//tools/browsers:browser_archive_repo.bzl", "browser_archive")

def define_chromium_repositories():
    """Defines archives for downloading Chromium."""

    # To update to a newer version of Chromium see instructions in
    # https://github.com/angular/dev-infra/blob/master/bazel/browsers/README.md.

    browser_archive(
        name = "org_chromium_chromium_linux_x64",
        licenses = ["notice"],  # BSD 3-clause (maybe more?)
        sha256 = "5c58e0e0e08e2e56ef34609195decc4898418a232c39d095db92e133facb3333",
        # 127.0.6533.0
        urls = ["https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/1313161/chrome-linux.zip"],
        named_files = {"CHROMIUM": "chrome-linux/chrome"},
        # Exclude a log file that chromium writes to each run, causing remote
        # cache misses.
        exclude_patterns = ["chrome-linux/chrome_debug.log"],
        exports_files = ["chrome-linux"],
    )

    browser_archive(
        name = "org_chromium_chromium_macos_x64",
        licenses = ["notice"],  # BSD 3-clause (maybe more?)
        sha256 = "bb95467ac4b4097833f707e58f079926a9cece4824c700da335c38081c7a4e5b",
        # 127.0.6533.0
        urls = ["https://storage.googleapis.com/chromium-browser-snapshots/Mac/1313161/chrome-mac.zip"],
        named_files = {
            "CHROMIUM": "chrome-mac/Chromium.app/Contents/MacOS/Chromium",
        },
        exclude_patterns = [
            # Exclude a log file that chromium writes to each run, causing
            # remote cache misses.
            "chrome-mac/Chromium.app/Contents/Frameworks/Chromium Framework.framework/Versions/*/chrome_debug.log",
        ],
        exports_files = ["chrome-mac"],
    )

    browser_archive(
        name = "org_chromium_chromium_macos_arm64",
        licenses = ["notice"],  # BSD 3-clause (maybe more?)
        sha256 = "98173187fab109a1e3431806811e95bff38e61682bbeaf8776733b5a378515ab",
        # 127.0.6533.0
        urls = ["https://storage.googleapis.com/chromium-browser-snapshots/Mac_Arm/1313161/chrome-mac.zip"],
        named_files = {
            "CHROMIUM": "chrome-mac/Chromium.app/Contents/MacOS/Chromium",
        },
        exclude_patterns = [
            # Exclude a log file that chromium writes to each run, causing
            # remote cache misses.
            "chrome-mac/Chromium.app/Contents/Frameworks/Chromium Framework.framework/Versions/*/chrome_debug.log",
        ],
        exports_files = ["chrome-mac"],
    )

    browser_archive(
        name = "org_chromium_chromium_windows",
        licenses = ["notice"],  # BSD 3-clause (maybe more?)
        sha256 = "e95965510d85b2593c308469ae007c839c3dd2f777a7c2fb31b90bc80bf66897",
        # 127.0.6533.0
        urls = ["https://storage.googleapis.com/chromium-browser-snapshots/Win/1313161/chrome-win.zip"],
        named_files = {"CHROMIUM": "chrome-win/chrome.exe"},
        exclude_patterns = [
            # Exclude files with spaces to prevent errors when symlinked as
            # runfiles (https://github.com/bazelbuild/bazel/issues/4327).
            "chrome-win/First Run",
            # Exclude a log file that chromium writes to each run, causing
            # remote cache misses.
            "chrome-win/debug.log",
        ],
        exports_files = ["chrome-win"],
    )

    browser_archive(
        name = "org_chromium_chromedriver_linux_x64",
        # BSD 3-clause, ICU, MPL 1.1, libpng (BSD/MIT-like),
        # Academic Free License v. 2.0, BSD 2-clause, MIT
        licenses = ["reciprocal"],
        sha256 = "a138e7c9c52a4b1ca46e91a7079337c4ec0f7f30677a6ae3b8e112e441dd1ece",
        urls = [
            "https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/1313161/chromedriver_linux64.zip",
        ],
        named_files = {"CHROMEDRIVER": "chromedriver_linux64/chromedriver"},
    )

    browser_archive(
        name = "org_chromium_chromedriver_macos_x64",
        # BSD 3-clause, ICU, MPL 1.1, libpng (BSD/MIT-like),
        # Academic Free License v. 2.0, BSD 2-clause, MIT
        licenses = ["reciprocal"],
        sha256 = "c55271c4483511dc4432b0495a025a125c6b4979e8f88aeb299963fcb83f9473",
        urls = ["https://storage.googleapis.com/chromium-browser-snapshots/Mac/1313161/chromedriver_mac64.zip"],
        named_files = {"CHROMEDRIVER": "chromedriver_mac64/chromedriver"},
    )

    browser_archive(
        name = "org_chromium_chromedriver_macos_arm64",
        # BSD 3-clause, ICU, MPL 1.1, libpng (BSD/MIT-like),
        # Academic Free License v. 2.0, BSD 2-clause, MIT
        licenses = ["reciprocal"],
        sha256 = "772722afb0beeaf6cda1618590d5c6c5fef7358357bcb1002ca5f8c4afc5e5ca",
        urls = ["https://storage.googleapis.com/chromium-browser-snapshots/Mac_Arm/1313161/chromedriver_mac64.zip"],
        named_files = {"CHROMEDRIVER": "chromedriver_mac64/chromedriver"},
    )

    browser_archive(
        name = "org_chromium_chromedriver_windows",
        # BSD 3-clause, ICU, MPL 1.1, libpng (BSD/MIT-like),
        # Academic Free License v. 2.0, BSD 2-clause, MIT
        licenses = ["reciprocal"],
        sha256 = "f04ac0dc046b6e4bea1bde4a6ee07090f94e3e3b6ca804952392565abf626e15",
        urls = ["https://storage.googleapis.com/chromium-browser-snapshots/Win/1313161/chromedriver_win32.zip"],
        named_files = {"CHROMEDRIVER": "chromedriver_win32/chromedriver.exe"},
    )
