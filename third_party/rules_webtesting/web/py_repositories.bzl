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
"""Defines external repositories needed by rules_webtesting."""

load(":repositories.bzl", "should_create_repository")
load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

def py_repositories(**kwargs):
    """Defines external repositories required to use Python webtest and screenshotter APIs.

    This function exists for other Bazel projects to call from their WORKSPACE
    file when depending on rules_webtesting using http_archive. This function
    makes it easy to import these transitive dependencies into the parent
    workspace. This will check to see if a repository has been previously defined
    before defining a new repository.

    Alternatively, individual dependencies may be excluded with an
    "omit_" + name parameter. This is useful for users who want to be rigorous
    about declaring their own direct dependencies, or when another Bazel project
    is depended upon (e.g. rules_closure) that defines the same dependencies as
    this one (e.g. com_google_guava_guava.) Alternatively, an allowlist model may be
    used by calling the individual functions this method references.

    Please note that while these dependencies are defined, they are not actually
    downloaded, unless a target is built that depends on them.

    Args:
        **kwargs: omit_... parameters used to prevent importing specific
          dependencies.
    """
    if should_create_repository("com_github_urllib3", kwargs):
        com_github_urllib3()
    if should_create_repository("org_seleniumhq_py", kwargs):
        org_seleniumhq_py()
    if kwargs.keys():
        print("The following parameters are unknown: " + str(kwargs.keys()))

def com_github_urllib3():
    http_archive(
        name = "com_github_urllib3",
        build_file = str(Label("//build_files:com_github_urllib3.BUILD")),
        sha256 = "a53063d8b9210a7bdec15e7b272776b9d42b2fd6816401a0d43006ad2f9902db",
        strip_prefix = "urllib3-1.25.2",
        urls = [
            "https://files.pythonhosted.org/packages/9a/8b/ea6d2beb2da6e331e9857d0a60b79ed4f72dcbc4e2c7f2d2521b0480fda2/urllib3-1.25.2.tar.gz",
        ],
    )

def org_seleniumhq_py():
    http_archive(
        name = "org_seleniumhq_py",
        build_file = str(Label("//build_files:org_seleniumhq_py.BUILD")),
        sha256 = "deaf32b60ad91a4611b98d8002757f29e6f2c2d5fcaf202e1c9ad06d6772300d",
        strip_prefix = "selenium-3.141.0",
        urls = [
            "https://files.pythonhosted.org/packages/ed/9c/9030520bf6ff0b4c98988448a93c04fcbd5b13cd9520074d8ed53569ccfe/selenium-3.141.0.tar.gz",
        ],
    )
