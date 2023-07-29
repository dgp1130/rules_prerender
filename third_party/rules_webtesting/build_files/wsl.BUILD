# Copyright 2019 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
################################################################################
#
load("//web:web.bzl", "web_test_named_executable")

licenses(["notice"])  # Apache 2.0

web_test_named_executable(
    name = "wsl",
    testonly = True,
    alt_name = "WEBDRIVER_SERVER_LIGHT",
    executable = "//go/wsl/main",
    visibility = ["//visibility:public"],
)