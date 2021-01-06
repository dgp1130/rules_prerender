# testonly

An example where all the build rules are marked `testonly` in order to verify
that the flag is properly propagated to all underlying rules. This doesn't do
anything interesting in its implementation, it simply tries to exercise as many
code paths as it can to ensure that `testonly` is supported.
