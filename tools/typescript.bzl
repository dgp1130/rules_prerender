load("@npm//@bazel/typescript:index.bzl", _ts_project = "ts_project")

def ts_project(name, tsconfig = None, **kwargs):
    _ts_project(
        name = name,
        tsconfig = tsconfig or "//:tsconfig.json",
        link_workspace_root = True,
        declaration = True,
        source_map = True,
        **kwargs
    )
