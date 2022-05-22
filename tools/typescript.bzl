load("@npm//@bazel/typescript:index.bzl", _ts_project = "ts_project")

def ts_project(name, tsconfig = None, link_workspace_root = True, **kwargs):
    _ts_project(
        name = name,
        tsconfig = tsconfig or "//:tsconfig.json",
        # TODO(#49): Can't use this and also depend on `//packages/rules_prerender`
        # or declarative shadow DOM due to conflicting `rules_prerender` module name
        # -> Bazel package mapping. Still defaults to `True` for now, but any targets
        # which use declarative shadow DOM need to set this to `False` and use
        # relative improts.
        link_workspace_root = link_workspace_root,
        declaration = True,
        source_map = True,
        **kwargs
    )
