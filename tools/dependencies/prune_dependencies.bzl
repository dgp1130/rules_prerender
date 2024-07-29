"""Defines `prune_dependencies` rule."""

load("@aspect_rules_js//npm:providers.bzl", "NpmPackageInfo")

visibility("private")

def _prune_dependencies_impl(ctx):
    npm_info = ctx.attr.pkg[NpmPackageInfo]
    return NpmPackageInfo(
        package = npm_info.package,
        version = npm_info.version,
        directory = npm_info.directory,
        npm_package_store_deps = depset([
            dep
            for dep in npm_info.npm_package_store_deps.to_list()
            if dep.package not in ctx.attr.prune
        ]),
    )

prune_dependencies = rule(
    implementation = _prune_dependencies_impl,
    attrs = {
        "pkg": attr.label(
            mandatory = True,
            providers = [NpmPackageInfo],
            doc = "An `npm_package` target to prune dependencies of.",
        ),
        "prune": attr.string_list(
            mandatory = True,
            doc = "A list of NPM packages to remove from dependencies",
        ),
    },
    doc = """
        Prunes (removes) the dependencies of a given NPM package. This is useful
        when building a package with a peer dependency on another local package.
        A dependency on `//:node_modules/other` is likely necessary to type
        check correctly, however this dependency should not persist because that
        dependency needs to be provided at link time in the user's workspace as
        `@user//:node_modules/other`.

        This rule supports removing the `//:node_modules/other` dependency so a
        second copy of it does not leak into the runtime environment and
        potentially cause errors.
    """,
)
