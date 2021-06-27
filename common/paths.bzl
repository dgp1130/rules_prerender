"""Utilities based around file paths."""

def is_js_file(src):
    """Returns whether or not the given src path is a JavaScript file."""
    return src.endswith(".js") or src.endswith(".mjs") or src.endswith(".cjs")
