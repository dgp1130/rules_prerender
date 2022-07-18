load("@aspect_bazel_lib//lib:copy_file.bzl", "copy_file")
load("@aspect_rules_jest//jest:defs.bzl", _jest_test = "jest_test")

def jest_test(name, **kwargs):
    # Jest config needs to be in the current Bazel package or a subpackage,
    # so copy the file with a unique name.
    config_file = "%s_config.js" % name
    copy_file(
        name = "%s_config" % name,
        src = "//:jest.config.js",
        out = config_file,
        testonly = True,
    )

    _jest_test(
        name = name,
        config = ":%s" % config_file,
        **kwargs,
    )
