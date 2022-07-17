load("@aspect_bazel_lib//lib:copy_file.bzl", "copy_file")
load("@aspect_rules_js//npm:defs.bzl", "npm_package")
load(
    "@build_bazel_rules_nodejs//:providers.bzl",
    "DeclarationInfo",
    "JSModuleInfo",
    "JSEcmaScriptModuleInfo",
)
load("//common:label.bzl", "absolute")
load(":prerender_component.bzl", "prerender_component")

_ComponentPackageInfo = provider(fields = {
    "name": "TODO",
    "prerender": "TODO",
    "scripts": "TODO",
    "styles": "TODO",
    "resources": "TODO",
})

def prerender_package(
    name,
    components,
    package_name,
    srcs = [],
    testonly = None,
    visibility = None,
):
    component_packages = []
    for (index, component) in enumerate(components):
        component_package = "%s_component_package_%s" % (name, index)
        _package_sources(
            name = component_package,
            component = component,
            testonly = testonly,
        )
        component_packages.append(":%s" % component_package)
    
    package_config = "%s_config" % name
    _package_config(
        name = package_config,
        component_packages = component_packages,
        testonly = testonly,
    )

    npm_package(
        name = name,
        srcs = component_packages + srcs + [
            ":%s" % package_config,
        ],
        testonly = testonly,
        visibility = visibility,
    )

def _package_sources(
    name,
    component,
    testonly = None,
    visibility = None,
):
    abs_component = absolute(component)

    prerender_sources = "%s_prerender" % name
    _transitive_sources(
        name = prerender_sources,
        testonly = testonly,
        deps = ["%s_prerender" % abs_component]
    )
    
    script_sources = "%s_scripts" % name
    _transitive_sources(
        name = script_sources,
        testonly = testonly,
        deps = ["%s_scripts" % abs_component]
    )

    _package_sources_rule(
        name = name,
        component_name = abs_component.split(":")[1],
        prerender = ":%s" % prerender_sources,
        scripts = ":%s" % script_sources,
        styles = "%s_styles" % abs_component,
        resources = "%s_resources" % abs_component,
        testonly = testonly,
        visibility = visibility,
    )

def _package_relative_path(ctx, file):
    return file.short_path[len(ctx.label.package) + 1:]

def _package_relative_paths(ctx, files):
    return [_package_relative_path(ctx, file)
            for file in files
            if file.short_path.startswith(ctx.label.package)]

def _package_sources_impl(ctx):
    return [
        DefaultInfo(files = depset(
            ctx.files.prerender +
            ctx.files.scripts +
            ctx.files.styles +
            ctx.files.resources,
        )),
        _ComponentPackageInfo(
            name = ctx.attr.component_name,
            prerender = ctx.files.prerender,
            scripts = ctx.files.scripts,
            styles = ctx.files.styles,
            resources = ctx.file.resources,
        ),
    ]

_package_sources_rule = rule(
    implementation = _package_sources_impl,
    attrs = {
        "component_name": attr.string(mandatory = True),
        "prerender": attr.label(mandatory = True),
        "scripts": attr.label(mandatory = True),
        "styles": attr.label(mandatory = True),
        "resources": attr.label(mandatory = True, allow_single_file = True),
    },
)

def _transitive_sources_impl(ctx):
    depsets = []
    for dep in ctx.attr.deps:
        if DeclarationInfo in dep:
            depsets.append(dep[DeclarationInfo].transitive_declarations)
        if JSModuleInfo in dep:
            depsets.append(dep[JSModuleInfo].sources)
        if JSEcmaScriptModuleInfo in dep:
            depsets.append(dep[JSEcmaScriptModuleInfo].sources)

    return DefaultInfo(files = depset([], transitive = depsets))

_transitive_sources = rule(
    implementation = _transitive_sources_impl,
    attrs = {
        "deps": attr.label_list(mandatory = True),
    },
)

def _package_config_impl(ctx):
    output = ctx.actions.declare_file("rules_prerender.json")

    ctx.actions.write(output, json.encode_indent(
        {"components": {component_package[_ComponentPackageInfo].name: _encode_component(ctx, component_package[_ComponentPackageInfo])
                       for component_package in ctx.attr.component_packages}},
        indent = "  ",
    ))

    return DefaultInfo(files = depset([output]))

def _encode_component(ctx, component):
    return {
        "prerender": _package_relative_paths(ctx, component.prerender),
        "scripts": _package_relative_paths(ctx, component.scripts),
        "styles": _package_relative_paths(ctx, component.styles),
        "resources": _package_relative_path(ctx, component.resources),
    }

_package_config = rule(
    implementation = _package_config_impl,
    attrs = {
        "component_packages": attr.label_list(
            mandatory = True,
            providers = [_ComponentPackageInfo],
        ),
    },
)
