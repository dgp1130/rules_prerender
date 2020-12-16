#!/bin/sh

set -e

readonly ACTUAL=${1}
readonly EXPECTED=${2}

# Simply diff the two files.
diff "${EXPECTED}" "${ACTUAL}"
