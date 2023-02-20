visibility(["//tools/rollup/tests/..."])

def _tree_impl(ctx):
    output = ctx.actions.declare_directory(ctx.label.name)

    ctx.actions.run_shell(
        command = """
            readonly OUTPUT="${1}"
            shift

            for SRC in ${@}; do
                cp "${SRC}" "${OUTPUT}"
            done
        """,
        arguments = [output.path] + [src.path for src in ctx.files.srcs],
        inputs = ctx.files.srcs,
        outputs = [output],
    )

    return DefaultInfo(files = depset([output]))

tree = rule(
    implementation = _tree_impl,
    attrs = {
        "srcs": attr.label_list(
            mandatory = True,
            allow_files = [".js"],
        ),
    },
)
