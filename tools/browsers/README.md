# Browser configuration and versioning for testing of Angular

NOTE: Most of this directory was forked from
https://github.com/angular/dev-infra/tree/1ad20ef9dd457de967252283c1a968b0d702d0ae/bazel/browsers/.

We use Chrome and Firefox to perform most end-to-end testing.

The version of Chrome used in tests within this monorepo is configured and
controlled via Bazel.

## Bazel

Bazel `jasmine_web_test_suite` targets will use Chromium or Firefox provisioned
by `//tools/browsers`. The version of Chrome and Firefox are specified in the
[`chromium.bzl`](./chromium/chromium.bzl) and
[`firefox.bzl`](./firefox/firefox.bzl) files.

The process of updating the Chrome or Firefox version is not straightforward,
but below are dedicated sections for each browser.

## Updating Chromium

1.  Run `bazel run //tools/browsers/update_script`

2.  Inspect the console output which looks like the following:

```
Release Info: https://storage.googleapis.com/chromium-find-releases-static/index.html#r885453
Click on the link above to determine the Chromium version number.

MAC:       https://storage.googleapis.com/chromium-browser-snapshots/Mac/885453/chrome-mac.zip
                0c7ed37b2128c992d5563a5b54d2c2790ce4872d2004b298ca073c7db4cc3f58
           https://storage.googleapis.com/chromium-browser-snapshots/Mac/885453/chromedriver_mac64.zip
                fc5150742c045b12ec0a138365b87be3d4216a52bf6b65c914325e941a3c8af7

WINDOWS:   https://storage.googleapis.com/chromium-browser-snapshots/Win/885453/chrome-win.zip
                2a78bc9331a9fd7d1153e9e87cad85948853d4e37427d053dc88887ac9774a69
           https://storage.googleapis.com/chromium-browser-snapshots/Win/885453/chromedriver_win32.zip
                bdde7e7aa6349dd0e6e185c07c2fdef4a8f60739eacd79ee49c175390231be20

LINUX:     https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/885453/chrome-linux.zip
                ac5d11ff66698cb29ece33f8a38de011d2384c609123f421b771aafeea87f679
           https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/885453/chromedriver_linux64.zip
                aa38374059252bb7896d79ac7bb4b3ee3eca84cfa5641f432e05bba5f04c01a2

```

3.  Click on the `Release Info` URL and update version number comments in the
    [`chromium.bzl`](./chromium/chromium.bzl) file so that it is easier to
    figure out which version of Chromium is configured.

4.  Update the `chromium` and `chromedriver` repository URLs for all platforms
    to use the new URLs printed out by the tool. Also make sure to update the
    SHA256 checksums. The tool prints the new checksums for convenient copy &
    paste.

## Firefox

In order to update Firefox, open the [`firefox.bzl`](./firefox/firefox.bzl) file
and update the repository URLs to the desired version. For example:

```python
platform_http_file(
    name = "org_mozilla_firefox_amd64",
    licenses = ["reciprocal"],  # MPL 2.0
    sha256 = "bde6e020556a21561e4b8d7aaecf8db7077951f179b98ca5d0305435bc6802c9",
    # Firefox v78.0
    urls = ["https://ftp.mozilla.org/pub/firefox/releases/78.0/linux-x86_64/en-US/firefox-78.0.tar.bz2"],
)
```

1.  Go to the `urls` property and update the URL by replacing all `78.0`
    occurrences with the version you intend to use. Once done, do the same
    change for other platforms (such as `macos`).

2.  Update the `sha256` checksum of the browser archives. You can do this by
    downloading the artifacts from the URLs you just updated, and then running
    `shasum` on those files:

    ```sh
    curl -L <BROWSER_URL> | shasum -a 256
    ```

3.  Go to
    https://firefox-source-docs.mozilla.org/testing/geckodriver/Support.html and
    find a version that is compatible with the version of Firefox being used.

4.  Update the `geckodriver` repository URLs to the desired version:

    ```python
    platform_http_file(
        name = "org_mozilla_geckodriver_amd64",
        licenses = ["reciprocal"],  # MPL 2.0
        sha256 = "d59ca434d8e41ec1e30dd7707b0c95171dd6d16056fb6db9c978449ad8b93cc0",
        # Geckodriver v0.26.0
        urls = ["https://github.com/mozilla/geckodriver/releases/download/v0.26.0/geckodriver-v0.26.0-linux64.tar.gz"],
    )
    ```

    For example, replace all occurrences of `0.26.0` with the newer version.

5.  Update the `sha256` checksum of the driver archives. You can do this by
    downloading the artifacts from the URLs you just updated, and then running
    `shasum` on those files:

    ```sh
    curl -L <DRIVER_URL> | shasum -a 256
    ```
