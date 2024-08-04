"""Defines `netlify_deploy` rule."""

load("@bazel_skylib//rules:build_test.bzl", "build_test")
load(
    "@rules_prerender_npm//:netlify-cli/package_json.bzl",
    netlify_cli_bin = "bin",
)

def netlify_deploy(name, site):
    """Generates a binary which deploys the given tree artifact to Netlify.

    Must `bazel run` with `NETLIFY_SITE_ID` and `NETLIFY_PAT` (for CI) to
    identify the site being pushed to and authenticate correctly. By default,
    this will push to a draft URL. `bazel run :deploy -- --prod` to deploy to
    production.
    """
    netlify_cli_bin.netlify_binary(
        name = name,
        data = [site],
        args = ["deploy"],
        # We choose to `chdir` over Netlify's `--dir` option because it does not
        # appear to use that option when resolving the `netlify.toml` file and
        # there does not appear to be a way to pass it explicitly.
        chdir = "$(rootpath %s)" % site,
    )

    build_test(
        name = "%s_test" % name,
        targets = [":%s" % name],
    )
