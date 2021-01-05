#!/bin/bash

# --- begin runfiles.bash initialization v2 ---
# Copy-pasted from the Bazel Bash runfiles library v2.
set -uo pipefail; f=bazel_tools/tools/bash/runfiles/runfiles.bash
source "${RUNFILES_DIR:-/dev/null}/$f" 2>/dev/null || \
  source "$(grep -sm1 "^$f " "${RUNFILES_MANIFEST_FILE:-/dev/null}" | cut -f2- -d' ')" 2>/dev/null || \
  source "$0.runfiles/$f" 2>/dev/null || \
  source "$(grep -sm1 "^$f " "$0.runfiles_manifest" | cut -f2- -d' ')" 2>/dev/null || \
  source "$(grep -sm1 "^$f " "$0.exe.runfiles_manifest" | cut -f2- -d' ')" 2>/dev/null || \
  { echo>&2 "ERROR: cannot find $f"; exit 1; }; f=; set -e
# --- end runfiles.bash initialization v2 ---

# CWD is at `.../${WORKSPACE_NAME}`, extract that string.
readonly WORKSPACE=$(realpath . | sed "s,.*/,,g")

# Format input to be `${WORKSPACE_NAME}/${PATH_TO_FILE}` so it will work with
# `$(rlocation)`.
# 
# Compiled inputs come from `$(rootpath ${file})` which returns either:
#   path/to/file for files in the primary workspace.
#   external/some_workspace/path/to/file for files in an external workspace.
# 
# However, `$(rlocation ${file}))` expects the path to be of the format:
#   some_workspace/path/to/file
#
# To fix this, we strip `external/` if present, and prefix with the current
# workspace if not.
function runfiles-path {
  readonly PATH="${1}"
  if [[ "${PATH}" =~ ^external/* ]]; then
    echo "${PATH:9}" # Strip leading `external/`.
  else
    echo "${WORKSPACE}/${PATH}" # Prefix workspace name.
  fi
}

# References to the binary and resources directory are built-in to the binary,
# so users can't change them at runtime.
readonly BINARY=$(rlocation $(runfiles-path "%BINARY%"))
readonly RESOURCES=$(rlocation $(runfiles-path "%RESOURCES%"))

# Execute the devserver binary. Must source its wrapper shell script or else
# $RUNFILES fails to load.
source "${BINARY}" "${RESOURCES}" ${@}
