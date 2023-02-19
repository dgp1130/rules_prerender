load("@aspect_bazel_lib//lib:directory_path.bzl", "DirectoryPathInfo")
load("@aspect_rules_js//js:providers.bzl", "JsInfo")

visibility("private")

def _collect_npm_deps(target, ctx):
    pass

def _npm_bundle_deps(ctx):
    if ctx.label.name != "node_modules":
        fail("`npm_bundle_deps()` _must_ be named `node_modules` for files to be laid out correctly.")

    transitive_packages = depset([],
        transitive = [dep[JsInfo].transitive_npm_linked_packages for dep in ctx.attr.deps],
    )
    packages = [(dep.package, dep.store_info.files.to_list()[0]) for dep in transitive_packages.to_list()]

    output = ctx.actions.declare_directory("node_modules")
    ctx.actions.run_shell(
        mnemonic = "NpmBundleDep",
        progress_message = "Bundling NPM dependency %{label}",
        command = """
            readonly NODE_MODULES="${1}"
            shift

            while [ ${#} != 0 ]; do
                readonly DEST="${NODE_MODULES}/${1}"
                shift
                readonly DIR="${1}"
                shift

                mkdir -p "${DEST}"
                cp -r "${DIR}"/* "${DEST}"
            done
        """,
        arguments = [output.path] + [value for (name, directory) in packages
                                           for value in [name, directory.path]],
        inputs = [directory for (_, directory) in packages],
        outputs = [output],
    )

    return [
        DefaultInfo(files = depset([output])),
        DirectoryPathInfo(
            path = "",
            directory = output,
        )
    ]

npm_bundle_deps = rule(
    implementation = _npm_bundle_deps,
    attrs = {
        "deps": attr.label_list(
            mandatory = True,
            providers = [JsInfo],
        ),
    },
)
