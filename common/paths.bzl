"""Utilities based around file paths."""

visibility("public")

def is_js_file(src):
    """Returns whether or not the given src path is a JavaScript file."""
    return src.endswith(".js") or src.endswith(".mjs") or src.endswith(".cjs")

def is_ts_file(src):
    """Returns whether or not the given src path is a TypeScript source file.
    
    Does _not_ include declaration files like `*.d.ts`.
    """
    return src.endswith(".ts") or src.endswith(".mts") or src.endswith(".cts")

def is_ts_declaration_file(src):
    """Returns whether or not the given src path is a TypeScript declaration file."""
    return src.endswith(".d.ts") or src.endswith(".d.mts") or src.endswith(".d.cts")

def js_output(src):
    """Returns the JS file which will be output by the given TypeScript file."""
    parts = src.split(".")
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
    else:
        fail("Expected a `[mc]?ts` extension, but got `%s`." % ext)
