load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_test")
load("@build_bazel_rules_nodejs//:providers.bzl", "JSEcmaScriptModuleInfo")

def wtr_test(name, deps):
    """Generates a `@web/test-runner` test.
    
    Params:
        name: The name of this target.
        deps: Dependencies to execute as tests. Must provide
            `JSEcmaScriptModuleInfo`.
    """
    # Collect all the transitive ESM dependencies.
    esm_sources = "%s_esm_sources" % name
    _transitive_esm_sources(
        name = esm_sources,
        deps = deps,
    )

    # Generate a config file.
    config = "%s_config.cjs" % name
    _wtr_config(
        name = "%s_config" % name,
        out = config,
        deps = deps,
    )

    # Execute the test.
    nodejs_test(
        name = name,
        data = [
            ":%s" % config,
            ":%s" % esm_sources,
            "@npm//@web/test-runner",
            "@npm//@web/test-runner-puppeteer",
        ],
        entry_point = "@npm//:node_modules/@web/test-runner/dist/bin.js",
        templated_args = [
            "--config", "$(rootpath %s)" % config,
            "--puppeteer",
        ],
    )

# Get the transitive ES6 sources of the list of dependencies and return them as
# `DefaultInfo()` files.
def _transitive_esm_sources_impl(ctx):
    return DefaultInfo(files = depset([],
        transitive = [dep[JSEcmaScriptModuleInfo].sources for dep in ctx.attr.deps]
    ))

_transitive_esm_sources = rule(
    implementation = _transitive_esm_sources_impl,
    attrs = {
        "deps": attr.label_list(
            mandatory = True,
            allow_empty = False,
            providers = [JSEcmaScriptModuleInfo],
        ),
    },
)

def _wtr_config_impl(ctx):
    # Source files in direct dependencies.
    test_sources = depset([],
        transitive = [dep[JSEcmaScriptModuleInfo].direct_sources for dep in ctx.attr.deps],
    )
    files = "\n".join(["    \"%s\"," % src.short_path
                       for src in test_sources.to_list()
                       if not src.path.endswith(".externs.js")])

    # Debug config options.
    debug_options = ["manual: true", "open: true"]
    debug = "\n".join(["  %s," % opt for opt in debug_options]) if ctx.var.get('debug-wtr') else ""

    # Generate a config file.
    ctx.actions.expand_template(
        template = ctx.file._template,
        substitutions = {
            "${FILES}": files,
            "${DEBUG}": debug,
        },
        output = ctx.outputs.out,
    )

# Generates a `@web/test-runner` configuration file to run the test files given
# as direct dependencies.
_wtr_config = rule(
    implementation = _wtr_config_impl,
    attrs = {
        "out": attr.output(mandatory = True),
        "deps": attr.label_list(
            mandatory = True,
            allow_empty = False,
            providers = [JSEcmaScriptModuleInfo],
        ),
        "_template": attr.label(
            default = "//tools/web_test_runner:config.cjs.template",
            allow_single_file = True,
        ),
    },
)
