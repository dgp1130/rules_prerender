# User

A user workspace which loads `rules_prerender` via `@npm//rules_prerender/...`.
This serves as a test case of run time execution via the `pkg_npm()` rule at
`//:pkg`.

## Usage

From the root directory of `rules_prerender`:

```shell
bazel run //:pkg.pack && (cd user/ && npm install ../rules_prerender-*.tgz --save-dev && npm install && bazel run //app:devserver)
```

Of course, you can edit the user repository and run whatever Bazel command you
want at the end to verify that things are working as expected.

This branch is intended to be somewhat long lived as needed until we have a more
automated means of testing run time execution. Feel free to rebase and update
this branch as appropriate.

## Foot guns

This "inner" repository ignores `bazel-*/`, `dist/`, and `node_modules/`
folders. This means you won't commit these artifacts when modifying it, which is
useful, but it also means those artifacts will remain after checking out another
commit. This can cause numerous errors in Bazel, so be sure to delete
[`user/`](./) after checking out a different commit. If you come back and check
this branch out again, you'll get all the source files back and the above
command will reinstall `node_modules/` for you. So don't be afraid to delete it.
