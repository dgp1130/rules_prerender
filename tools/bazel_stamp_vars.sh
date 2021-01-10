#!/usr/bin/env bash

set -u -e -o pipefail

# This is a workspace status script which is used to generate data for stamped
# builds. It prints space-separate key-value pairs line-by-line which can be
# used in stamp-aware Bazel rules (such as `pkg_npm()`'s `substitutions'
# attribute). This script should be used in Bazel's `workspace_status_command`
# to generate the relevant data.
#
# See: https://bazelbuild.github.io/rules_nodejs/stamping.html#stamping-with-a-workspace-status-script
#
# Usage:
#     ./bazel_stamp_vars.sh ${rules_prerender_version}
#
# Parameters:
#     rules_prerender_version: The semver string to use as the `version` field
#         of the `rules_prerender` `package.json` file.

# Expose NPM package version of `rules_prerender`.
if [ -z "${1-}" ]; then
    echo "Missing NPM version for \`rules_prerender\` package. Did you forget" \
        "to pass it? If you are using \`--config release\`, make sure to set" \
        "\$BAZEL_RULES_PRERENDER_VERSION." >&2
    exit 1
fi
echo STABLE_RULES_PRERENDER_VERSION ${1}
