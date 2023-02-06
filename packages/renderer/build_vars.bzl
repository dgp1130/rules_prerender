"""Build variables for the renderer binary."""

# There is no singular `js_binary()` for the renderer. Instead one is generated at each
# invocation in order to include user code directly in the tool. As a result, any runtime
# dependencies needed for the renderer (such as NPM packages), **must** be added here where
# the generated tool will load from.
RENDERER_RUNTIME_DEPS = [
    "@rules_prerender//:node_modules/yargs",
]
