load(":ts_project.bzl", _ts_project = "ts_project")
load(":types_only.bzl", _types_only = "types_only")

visibility("public")

ts_project = _ts_project
types_only = _types_only
