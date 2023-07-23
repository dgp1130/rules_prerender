# `prerender_component` Architecture

A `prerender_component` is an encapsulation of all 4 "slices" of a component:
*   the HTML prerendering library
*   the client-side JavaScript library
*   the CSS styles library
*   any static or generated resource files at specific paths (`/logo.png`,
    `/roboto.woff`, etc.)

IMPORTANT: The main goal of `prerender_component` is to make it generally
_impossible_ to depend on just one slice without also depending on all the other
slices.

`prerender_component` doesn't actually _do_ anything with its slices. Instead,
it is a macro which organizes its inputs into a specific structure. Consider the
following example:

```python
load("@rules_prerender//:index.bzl", "prerender_component")

prerender_component(
    name = "component",
    prerender = ":prerender",
    scripts = ":scripts",
    styles = ":styles",
    resources = ":resources",
    # ...
)

# ...
```

*   `:component` - A target containing build-time validations to sanity check
    the component's implementation. This does not generate any useful output,
    and is not actually built by default. This target is merely for validation.
*   `:component_prerender` - Alias to HTML prerendering library (`:prerender`).
*   `:component_scripts` - Alias to the client-side JavaScript library
    (`:scripts`).
*   `:component_styles` - Alias to the CSS styles library (`:styles`).
*   `:component_resources` - Alias to the generate resources (`:resources`).
*   `:component_metadata` - A `PrerenderMetadataInfo` provider linking together
    all the various slices.

Each slice is only an alias to the inputs of `prerender_component`, however each
one _also_ provides the `PrerenderMetadataInfo` from `:component_metadata`. This
means that each slice alias also includes this extra metadata provider, and any
dependency on a slice alias can find this metadata.

Only the slice aliases are considered "public API" of the `prerender_component`
macro. `:component_metadata` is internal-only, and `:component` is not
guaranteed to output anything.

## `PrerenderMetadataInfo`

So what is `PrerenderMetadataInfo`?
[The definition](/packages/rules_prerender/prerender_metadata.bzl) looks like:

```python
PrerenderMetadataInfo = provider(
    "Holds all the providers for each component \"slice\".",
    fields = {
        "prerender": "The JSInfo of the prerender target.",
        "scripts": "The JSInfo of the scripts target.",
        "styles": "The CssInfo of the styles target.",
        "styles_import_map": "The CssImportMapInfo of the styles target.",
        "resources": "The WebResourceInfo of the resources target.",
        "component_check": "The DefaultInfo of the component check target.",
    },
)
```

The metadata provider captures all the slices of a `prerender_component` into a
single place. This means anyone with a `PrerenderMetadataInfo` has all the
content for the component.

`:component_metadata` itself has dependencies on all the input slices to capture
everything together into a single provider. Since each slice alias _also_
provides this metadata, it means tha any incoming dependency edge on a
`prerender_component` slice alias (such as `:component_prerender`) has access to
the `PrerenderMetadataInfo`. That means it also has knowledge of the client-side
scripts, CSS styles, and generated resources required by the component.

This is how we avoid "dropping" slices which are not directly used. As one
example, even if you only depend on `:component_prerender`, you will still get
the `PrerenderMetadataInfo` which contains the `CssInfo` and any associated
styles for that component. When the bundler tries to inline all styles on the
page, it can find that `CssInfo` and do the right thing.

## `prerender_component` dependency graphs

The dependency graph for a component looks a bit awkward as a result, but is
important to understand how everything is connected.

![A dependency graph of a component demonstrating how the generated targets
relate to each other.](https://g.gravizo.com/source/svg?https%3A%2F%2Fraw.githubusercontent.com%2Fdgp1130%2Frules_prerender%2Fmain%2Fdocs%2Finternal%2Farchitecture%2Fcomponent.dot)

This can be difficult to parse, so let's filter the graph down to some important
attributes. First we can see that each slice alias has a direct dependency on
its associated input. Remember that the names of the component inputs are
defined by the user and not consistent. Aliasing at known `:component_*` names
exposes these targets as the "public API" of `:component`.

![A subset of the first dependency graph. It identifies two groups. First,
`:component_prerender`, `:component_scripts`, `:component_styles`, and
`:component_resources` are labeled as "Slice Aliases". Second, `:prerender`,
`:scripts`, `:styles`, and `:resources` are labeled as "Component Inputs". Each
slice alias has a direct dependency on its associated component input.](https://g.gravizo.com/source/svg?https%3A%2F%2Fraw.githubusercontent.com%2Fdgp1130%2Frules_prerender%2Fmain%2Fdocs%2Finternal%2Farchitecture%2Fcomponent_aliases.dot)

Second, we can focus on the `:component_metadata` target to see that it lies
between all the slice aliases and component inputs. It effectively collects all
the component inputs together and then re-exports all of them at _each_ slice
alias. This is how users of `:component_prerender` are able to pull in all the
associated scripts, styles, and resources even though they did not directly
depend on those slices.

![A subset of the first dependency graph. It identifies the same "Slice Aliases"
and "Component Inputs" as the previous graph. However between the two sets is
the `:component_metadata` target. Every slice alias depends on
`:component_metadata`, which itself depends on every component input.](https://g.gravizo.com/source/svg?https%3A%2F%2Fraw.githubusercontent.com%2Fdgp1130%2Frules_prerender%2Fmain%2Fdocs%2Finternal%2Farchitecture%2Fcomponent_metadata.dot)

Third, we can look at the `:component` target. Since this is just a validation
check, it depends on all the component inputs. This means that building
`:component` will build all the slices of the component. This target is not
actually built in a typical build, however it is useful for
`bazel build :component` and `build_test` to work as users expect.

![A subset of the first dependency graph. It identifies the same "Slice Aliases"
as the previous graphs. However it also shows the `:component` target, which has
a direct dependency on every component input.](https://g.gravizo.com/source/svg?https%3A%2F%2Fraw.githubusercontent.com%2Fdgp1130%2Frules_prerender%2Fmain%2Fdocs%2Finternal%2Farchitecture%2Fcomponent_check.dot)

## Component dependencies

An important aspect of `prerender_component` is that it is composable. So what
does the dependency graph look like between two components? Consider the
following case where a component depends on another via the prerendering
library.

```python
load("@rules_prerender//:index.bzl", "prerender_component")

prerender_component(
    name = "foo",
    prerender = ":foo_prerender_lib",
    # ...
)

ts_project(
    name = "foo_prerender_lib",
    srcs = ["foo.mts"],
    # Depends on `:bar` via the `_prerender` alias.
    deps = [":bar_prerender"],
)

prerender_component(
    name = "bar",
    prerender = ":bar_prerender_lib",
    scripts = ":bar_scripts_lib",
    # ...
)
```

Expanding the `prerender_component` targets, this means the dependency graph
looks like this:

![A dependency graph showing the relationship between the generated targets for
`:foo` and `:bar`. The graph starts at `:foo_prerender`. Because
`:bar_prerender` has a dependency on `:bar_metadata`, the `:bar_scripts_lib`
target is pulled into the dependency graph.](https://g.gravizo.com/source/svg?https%3A%2F%2Fraw.githubusercontent.com%2Fdgp1130%2Frules_prerender%2Fmain%2Fdocs%2Finternal%2Farchitecture%2Fcomponent_composition.dot)

Because of this structure, any dependency on `:foo_prerender` inherently has a
path to `:bar_metadata` and all the component slices for `:bar`, including
`:bar_scripts_lib`. This means an aspect looking for `PrerenderMetadataInfo`
will find both the `:foo_metadata` and `:bar_metadata` targets, collecting all
their other slices and bundling them with the rest of the application.

Note that this does _not_ mean that `:bar_scripts_lib` needs to be built before
`:foo_prerender`. This is all done at Bazel analysis. The files generated by
`:bar_scripts_lib` are not used by an action until the bundling phase, so all
component `_prerender` can build without being blocked on upstream `_scripts`
targets, or other component slices.
