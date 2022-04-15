load("@npm//@bazel/postcss:index.bzl", "postcss_multi_binary")
load(":postcss_import_plugin.bzl", IMPORT_PLUGIN_CONFIG = "PLUGIN_CONFIG")

_CssInfo = provider(fields = ["sources", "transitive_sources"])
CssImportMap = provider(fields = ["import_map"])

# TODO: Strict deps?
def _css_library_impl(ctx):
    return [
        DefaultInfo(files = depset(ctx.files.srcs)),
        _CssInfo(
            sources = ctx.files.srcs,
            transitive_sources = depset(ctx.files.srcs,
                transitive = [dep[_CssInfo].transitive_sources
                            for dep in ctx.attr.deps],
            ),
        ),
    ]

css_library = rule(
    implementation = _css_library_impl,
    attrs = {
        "srcs": attr.label_list(allow_files = True),
        "deps": attr.label_list(providers = [_CssInfo]),
    },
)

# It might look like this implementation should accept multiple `css_library()` targets,
# but doing so would be a bad idea. This is because the library is separated into "direct
# sources" and "transitive dependencies" which are fed into `postcss_multi_binary()`. If
# this allowed multiple libraries and same split was done, it would be "all libraries'
# direct sources" and "all libraries' transitive dependencies". This sounds reasonable,
# but would break strict deps. If one library had `@import url("rules_prerender/foo");`
# but forgot to add a dep on `//:foo` yet another library in this binary had a dep on
# `//:foo`, the first would incorrectly compile successfully. As a result, we need a
# separate `postcss_multi_binary()` for each compiled `css_library()`.
def _css_binary(name, lib, testonly = None, visibility = None):
    """TODO"""
    # Collect all transitive CSS dependencies into a single `DefaultInfo` target.
    css_transitive_deps = "%s_transitive_deps" % name
    _css_deps(
        name = css_transitive_deps,
        lib = lib,
        testonly = testonly,
    )

    # Compile the CSS. This only compiles one library, but that library may have many
    # source files, each one should be compiled into its own output, which requires
    # `postcss_multi_binary()` even though `postcss_binary()` sounds like it would be
    # sufficient here.
    # TODO: What if `lib` has two files with the same name in different directories?
    binary = "%s_postcss" % name
    postcss_multi_binary(
        name = binary,
        srcs = [lib],
        output_pattern = "{name}",
        sourcemap = True,
        plugins = {
            "//tools/internal:postcss_import_plugin": IMPORT_PLUGIN_CONFIG,
        },
        testonly = testonly,
        visibility = visibility,
        deps = [":%s" % css_transitive_deps],
    )

    # Return the binary outputs with a map of import name -> file path.
    _css_map(
        name = name,
        bin = ":%s" % binary,
        lib = lib,
    )

def css_multi_binary(name, libs, testonly = None, visibility = None):
    """TODO"""
    binaries = []
    for (index, lib) in enumerate(libs):
        binary_name = "%s_binary_%s" % (name, index)
        _css_binary(
            name = binary_name,
            lib = lib,
            testonly = testonly,
        )
        binaries.append(binary_name)
    
    css_group(
        name = name,
        deps = [":%s" % binary for binary in binaries],
        testonly = testonly,
        visibility = visibility,
    )

def _css_deps_impl(ctx):
    return DefaultInfo(
        files = ctx.attr.lib[_CssInfo].transitive_sources,
    )

_css_deps = rule(
    implementation = _css_deps_impl,
    attrs = {
        "lib": attr.label(
            mandatory = True,
            providers = [_CssInfo],
        ),
    },
)

def _css_map_impl(ctx):
    lib_files = sorted(ctx.attr.lib[_CssInfo].sources)
    bin_files = sorted([file for file in ctx.files.bin if not file.basename.endswith(".map")])

    if len(lib_files) != len(bin_files):
        fail(("Number of files from the CSS library (%s from %s) does not equal the" +
              " number of files from the CSS binary (%s from %s)") % (
                  len(lib_files),
                  ctx.attr.lib.label,
                  len(bin_files),
                  ctx.attr.bin.label,
             ))

    import_map = dict()
    lib_wksp = (ctx.attr.lib.label.workspace_name
                if ctx.attr.lib.label.workspace_name
                else ctx.workspace_name)
    for index in range(len(lib_files)):
        lib_file = lib_files[index]
        bin_file = bin_files[index]

        # The library and binary file should have the same name, but might be in different
        # packages.
        if lib_file.basename != bin_file.basename:
            fail(("CSS library files did not match up with CSS binary files.\n" +
                  "Lib files:\n%s\n\nBin files:\n%s") % (
                      "\n".join([file.path for file in lib_files]),
                      "\n".join([file.path for file in bin_files]),
                  ))

        key = "%s/%s" % (lib_wksp, lib_file.short_path)
        if key in import_map:
            fail("CSS library file (%s) mapped twice, once to %s and a second time to %s." % (
                key,
                import_map[key].path,
                bin_file.path,
            ))

        import_map[key] = bin_file

    return [
        ctx.attr.bin[DefaultInfo],
        CssImportMap(import_map = import_map)
    ]

_css_map = rule(
    implementation = _css_map_impl,
    attrs = {
        "bin": attr.label(mandatory = True),
        "lib": attr.label(
            mandatory = True,
            providers = [_CssInfo],
        ),
    },
)

def _css_group_impl(ctx):
    return [
        DefaultInfo(
            files = depset([], transitive = [dep[DefaultInfo].files
                                             for dep in ctx.attr.deps]),
        ),
        CssImportMap(
            import_map = _merge_import_maps([dep[CssImportMap]
                                             for dep in ctx.attr.deps
                                             if CssImportMap in dep]),
        ),
    ]

css_group = rule(
    implementation = _css_group_impl,
    attrs = {
        "deps": attr.label_list(mandatory = True),
    },
)

def _merge_import_maps(css_import_maps):
    """Merges a list of `CssImportMap` into a single `CssImportMap`.
    
    Fails the build if the same import path appears as a key in two maps.
    """
    import_map = dict()
    for css_import_map in css_import_maps:
        for (key, value) in css_import_map.import_map.items():
            if key in import_map:
                fail(("Found duplicate CSS import path in `_css_group()`. %s maps to" +
                      " both %s and %s." % (key, import_map[key], value)))
            import_map[key] = value

    return import_map
