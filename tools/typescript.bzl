"""Default configuration for `ts_project()`."""

load("@npm//@bazel/typescript:index.bzl", _ts_project = "ts_project")

def ts_project(
    declaration = True,
    declaration_map = True,
    source_map = True,
    tsconfig = "//:tsconfig.json",
    link_workspace_root = True,
    **kwargs
):
    _ts_project(
        declaration = declaration,
        declaration_map = declaration_map,
        source_map = source_map,
        tsconfig = tsconfig,
        link_workspace_root = link_workspace_root,
        **kwargs
    )
