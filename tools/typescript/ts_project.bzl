"""Defines `ts_project` wrapper macro."""

load("@aspect_rules_ts//ts:defs.bzl", _ts_project = "ts_project")

visibility("private")

def ts_project(name, srcs, tsconfig = None, **kwargs):
    # TypeScript does not support `*.mtsx` files, therefore we need to rely on
    # `type: "module"` in `package.json` to mark them as ESM. This is normally
    # pretty easy to do, but the Bazel sandbox works against us, because
    # TypeScript can't see the `package.json` files normally. Instead we need to
    # manually add the relevant `package.json` to the compilation so TypeScript
    # can find the `type: "module"` property.
    #
    # This would be infeasible to manage for *every* affected `ts_project` and
    # explicitly depend on the correct `package.json`. Instead we rely on file
    # conventions to know that `//packages/*:package` contains the
    # `package.json` file for that NPM package. All others use the workspace
    # root `//:package`.
    package_json = _infer_package_json(native.package_name())

    _ts_project(
        name = name,
        srcs = srcs + [package_json],
        tsconfig = tsconfig or "//:tsconfig",
        declaration = True,
        source_map = True,
        transpiler = "tsc",
        **kwargs
    )

def _infer_package_json(package):
    if not package.startswith("packages/"):
        # Use the root `package.json` file for anything without a more specific
        # file.
        return "//:package"
    elif package.startswith("packages/rules_prerender"):
        # The `rules_prerender` is still weird for legacy reasons and published
        # with the root `package.json` file, so we should use that.
        return "//:package"
    else:
        # Extract `packages/${package_name}/path/to/pkg` and use that for the
        # `package.json` file.
        package_name = package.split("/")[1]
        return "//packages/%s:package" % package_name
