"""Utilities related to Bazel labels."""

def absolute(
    target,
    repository_name = native.repository_name,
    package_name = native.package_name,
):
    """Returns an absolute path to the provided possibly-relative target.

    This is useful for generating labels for targets that are siblings of a
    provided target. Since a given path could be relative (`:foo`),
    absolute (`//foo:bar`), external (`@foo//bar:baz`), or use a default target
    (`//foo`), string transformations are easy to mess up. Example usage:

    ```starlark
    load("//common:label.bzl", "absolute")
    def my_macro(name, deps = []):
        my_rule(
            name = name,
            # Use `absolute(dep)` to get a full path and find a sibling target.
            # Without `absolute(dep)`, this logic would fail for a target with a
            # default name, such as `//foo`, which would resolve to
            # `//foo_sibling` instead of the desired `//foo:foo_sibling`.
            deps = ["%s_sibling" % absolute(dep) for dep in deps],
        )
    ```
    
    Args:
        target: A label string which may be relative or absolute.
        repository_name: Function which returns the repository name. Used for
            tests only, should not be set in production code.
        package_name: Function which returns the package name. Used for tests
            only, should not be set in production code.
    
    Returns: The absolute path to the provided target. If the target is
        relative, then it is interpretted as relative to the current package as
        determined by `native.repository_name()` and `native.package_name()`.
    """
    lbl = Label("%s//%s:__pkg__" % (
        repository_name(),
        package_name(),
    ))
    return str(lbl.relative(target))
