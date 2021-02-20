#!/bin/bash

readonly ACTUAL="$1"
readonly EXPECTED="$2"
diff "$ACTUAL" <(echo -n "$EXPECTED")
