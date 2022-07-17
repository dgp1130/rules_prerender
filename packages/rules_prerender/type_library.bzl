load("@build_bazel_rules_nodejs//:providers.bzl", "DeclarationInfo", "LinkablePackageInfo")

def _type_library_impl(ctx):
    providers = [ctx.attr.dep[DeclarationInfo]]
    if LinkablePackageInfo in ctx.attr.dep:
        providers.append(ctx.attr.dep[LinkablePackageInfo])
    return providers

type_library = rule(
    implementation = _type_library_impl,
    attrs = {
        "dep": attr.label(
            mandatory = True,
            providers = [DeclarationInfo],
        ),
    },
)
