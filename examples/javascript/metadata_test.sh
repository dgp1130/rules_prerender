#!/bin/bash

set -e

readonly ACTUAL="${1}"
readonly EXPECTED="${2}"

diff "${EXPECTED}" "${ACTUAL}"
