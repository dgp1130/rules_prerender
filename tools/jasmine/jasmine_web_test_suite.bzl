"""Jasmine wrapper of `web_test_suite()`.

Implementation inspired by:
https://github.com/bazelbuild/rules_webtesting/blob/6b47a3f11b7f302c2620a3552cf8eea8855e8c9e/web/internal/wrap_web_test_suite.bzl
"""

load("@io_bazel_rules_webtesting//web:web.bzl", "web_test_suite")
load("//common:label.bzl", "absolute")
load(":jasmine_node_test.bzl", "jasmine_node_test")

visibility("private")

# When a browser target name matches with one of these tags, they are used for
# the generated `web_test()`.
_DEFAULT_WEB_TEST_SUITE_TAGS = {
    "chromium": ["native"],
    "firefox": ["native", "noci"],
}

_DEFAULT_BROWSERS = [
    "//tools/browsers/chromium",
    "//tools/browsers/firefox",
]

def jasmine_web_test_suite(
        name,
        browsers = _DEFAULT_BROWSERS,
        config = None,
        flaky = None,
        local = None,
        shard_count = None,
        size = "small",
        tags = _DEFAULT_WEB_TEST_SUITE_TAGS,
        wrapped_test_tags = ["manual", "noci"],
        test_suite_tags = ["manual"],
        timeout = None,
        visibility = None,
        **kwargs):
    """Defines a `jasmine_node_test()` with a `web_test_suite()` wrapper.

    This is mainly for WebDriverIO tests, since it generates and starts a
    WebDriver server for the `jasmine_node_test()`.

    Args:
        name: See https://docs.bazel.build/versions/main/be/common-definitions.html.
        browsers: A sequence of labels specifying the browsers to use. Generally
            under `//tools/browsers:*`.
        config: Optional label to configure web test features.
        flaky: A boolean specifying that the test is flaky. If set, the test
            will be retried up to 3 times. Defaults to `False`.
        local: A boolean specifying whether the test should always be run
            locally.
        shard_count: The number of test shards to use per browser. Default: 1.
        size: A string specifying the test size. Defaults to "large".
        tags: A list of tag strings to apply to each generated `web_test()`
            target. See: https://docs.bazel.build/versions/main/be/common-definitions.html
        wrapped_test_tags: A list of tag strings to use for the
            `jasmine_node_test()` test. Defaults to `["manual", "noci"]` and
            should always include those values, since this test will never pass
            directly, and should always ve executed via the `web_test()`
            wrapper. See: https://docs.bazel.build/versions/main/be/common-definitions.html
        test_suite_tags: A list of tag strings for the generated `test_suite()`.
            See: https://docs.bazel.build/versions/main/be/common-definitions.html
        timeout: A string specifying the test timeout, computed from the size by
            default.
        visibility: https://docs.bazel.build/versions/main/be/common-definitions.html
        **kwargs: Arguments for the `jasmine_node_test()` target.
    """
    wrapped_test_name = "%s_wrapped_test" % name
    wrapped_test_config = "%s_config.json" % wrapped_test_name

    # The wrapped `jasmine_node_test()` being executed.
    jasmine_node_test(
        name = wrapped_test_name,
        flaky = flaky,
        local = local,
        shard_count = shard_count,
        size = size,
        tags = wrapped_test_tags,
        timeout = timeout,
        **kwargs
    )

    # The wrapper `web_test_suite()` target which generates one test per browser
    # and configures WebDriver for the test.
    web_test_suite(
        name = name,
        test = ":%s" % wrapped_test_name,
        # For whatever reason, `web_test_suite` _requires_ an explicit target.
        # `//foo` isn't good enough, we need `//foo:foo`. Since this is easy to
        # forget, we automatically do the conversion for users.
        browsers = [absolute(browser) for browser in browsers],
        config = config,
        data = [":%s" % wrapped_test_config],
        flaky = flaky,
        local = local,
        shard_count = shard_count,
        size = size,
        tags = tags,
        test_suite_tags = test_suite_tags,
        timeout = timeout,
        visibility = visibility,
    )
