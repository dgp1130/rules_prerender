# --- begin runfiles.bash initialization v2 ---
# Copy-pasted from the Bazel Bash runfiles library v2.
set -uo pipefail; set +e; f=bazel_tools/tools/bash/runfiles/runfiles.bash
source "${RUNFILES_DIR:-/dev/null}/$f" 2>/dev/null || \
    source "$(grep -sm1 "^$f " "${RUNFILES_MANIFEST_FILE:-/dev/null}" | cut -f2- -d' ')" 2>/dev/null || \
    source "$0.runfiles/$f" 2>/dev/null || \
    source "$(grep -sm1 "^$f " "$0.runfiles_manifest" | cut -f2- -d' ')" 2>/dev/null || \
    source "$(grep -sm1 "^$f " "$0.exe.runfiles_manifest" | cut -f2- -d' ')" 2>/dev/null || \
    { echo>&2 "ERROR: cannot find $f"; exit 1; }; f=; set -e
# --- end runfiles.bash initialization v2 ---

# Resolve arguments.
readonly PACKAGE="$(rlocation ${1})"
readonly NPMRC="$(rlocation ${2})"
readonly NPM="$(rlocation ${3})"

# Make sure there isn't already an `.npmrc` file in the package.
if [[ -f "${PACKAGE}/.npmrc" ]]; then
    echo ".npmrc already exists in `${PACKAGE}`, expected it not to." >&2
    exit 1
fi

# Merge the package and the `.npmrc` in the temporary staging directory.
readonly STAGING_DIRECTORY=$(mktemp -d)
cp -r ${PACKAGE}/* "${STAGING_DIRECTORY}"
cp "${NPMRC}" "${STAGING_DIRECTORY}/.npmrc"

# Publish to NPM. Use `--no-git-checks` to ignore the `.git/` state, which is
# still discovered by NPM, even within a Bazel context.
"${NPM}" publish "${STAGING_DIRECTORY}" --no-git-checks --access public
