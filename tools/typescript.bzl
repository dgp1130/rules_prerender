load("@npm//@bazel/typescript:index.bzl", real_ts_project = "ts_project")

def ts_project(name, **kwargs):
    real_ts_project(
        name = name,
        tsconfig = "//:tsconfig.json",
        link_workspace_root = True,
        declaration = True,
        source_map = True,
        **kwargs
    )
