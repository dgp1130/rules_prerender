# load("@npm//@bazel/typescript:index.bzl", _ts_project = "ts_project")
load("@aspect_rules_ts//ts:defs.bzl", _ts_project = "ts_project")

def ts_project(name, tsconfig = None, **kwargs):
    _ts_project(
        name = name,
        tsconfig = {},
        extends = tsconfig or "//:tsconfig_rules_ts",
        declaration = True,
        source_map = True,
        **kwargs
    )
