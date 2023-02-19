load(":jasmine_node_test.bzl", _jasmine_node_test = "jasmine_node_test")
load(
    ":jasmine_web_test_suite.bzl",
    _jasmine_web_test_suite = "jasmine_web_test_suite",
)

jasmine_node_test = _jasmine_node_test
jasmine_web_test_suite = _jasmine_web_test_suite
