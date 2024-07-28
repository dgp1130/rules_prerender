"""Utilities based around file paths."""

visibility("public")

def is_js_file(src):
    """Returns whether or not the given src path is a JavaScript file."""
    return src.endswith(".js") or src.endswith(".mjs") or src.endswith(".cjs") or src.endswith(".jsx")

def is_ts_file(src):
    """Returns whether or not the given src path is a TypeScript source file.

    Does _not_ include declaration files like `*.d.ts`.
    """
    if is_ts_declaration_file(src):
        return False

    return src.endswith(".ts") or src.endswith(".mts") or src.endswith(".cts") or src.endswith(".tsx")

def is_ts_declaration_file(src):
    """Returns whether or not the given src path is a TypeScript declaration file."""
    return src.endswith(".d.ts") or src.endswith(".d.mts") or src.endswith(".d.cts")

def js_output(src):
    """Returns the JS file which will be output by the given TypeScript file."""
    parts = src.split(".")
    if len(parts) == 1:
        fail("No extension on file `%s`." % src)

    rest = parts[:-1]
    ext = parts[-1]
    js_ext = _to_js_extension(ext)

    return ".".join(rest) + "." + js_ext

def _to_js_extension(ext):
    if ext == "ts":
        return "js"
    elif ext == "mts":
        return "mjs"
    elif ext == "cts":
        return "cjs"
    elif ext == "tsx":
        # `tsc` converts `*.tsx` files into `*.js` files.
        return "js"
    else:
        fail("Expected a `[mc]?ts|tsx` extension, but got `%s`." % ext)
