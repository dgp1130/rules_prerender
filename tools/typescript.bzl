load("@aspect_rules_ts//ts:defs.bzl", _ts_project = "ts_project")

def ts_project(name, tsconfig = None, **kwargs):
    _ts_project(
        name = name,
        tsconfig = tsconfig or "//:tsconfig.json",
        declaration = True,
        source_map = True,
        **kwargs
    )
