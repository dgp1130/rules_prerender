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

def file_path_of(lbl):
    """Returns the runtime file path to the given target.

    Args:
        lbl: An absolute target (as a string) to generate the file path of.

    Returns:
        The runtime path to the provided target. Generally of the form
        `workspace_name/path/to/pkg/target`. Workspace name is dropped if in the
        primary workspace. Package path is dropped if in the root level package.
    """
    # Isolate the workspace name, package, and target strings.
    [wksp, absolute_path] = lbl.split("//")
    [pkg, target] = absolute_path.split(":")

    # Build a file path to the given target.
    path_to_target = "%s/%s" % (pkg, target) if pkg else target
    if not wksp:
        return path_to_target

    return "%s/%s" % (wksp.replace("@", ""), path_to_target)

def rel_path(file_path, package_name = native.package_name):
    """Converts a workspace-relative absolute path to a relative path.
    
    Args:
        file_path: Absolute file path from workspace root.
        package_name: Function which returns the package name. Used for tests
            only, should not be set in production code.

    Returns: A relative path to the given file from the current package.
    """
    package = package_name()
    back_out = "/".join([".." for _ in package.split("/")]) if package != "" else "."
    return "%s/%s" % (back_out, file_path)
