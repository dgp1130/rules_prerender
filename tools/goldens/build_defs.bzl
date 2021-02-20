"""Defines golden testing functionality."""

def golden_test(name, actual, expected):
    """Tests that the given file matches the expected string.
    
    Params:
        name: The name of this test.
        actual: The actual file to test.
        expected: The expected output as a string. Note: This string is used as
            a Bash argument and manually quoted by wrapping it in "" due to
            weirdness in Bazel. The string must **not** contain a double quote
            character.
    """
    if "\"" in expected:
        fail("Expected string must not contain a quote character:\n" + expected)

    native.sh_test(
        name = name,
        srcs = ["//tools/goldens:golden_test.sh"],
        data = [actual],
        args = [
            "$(location %s)" % actual,
            # Shell arguments are not quoted. Easiest option is to quote them
            # here and declare that the `expected` param should not contain
            # quotes. See https://github.com/bazelbuild/bazel/issues/13072.
            "\"%s\"" % expected,
        ],
    )
