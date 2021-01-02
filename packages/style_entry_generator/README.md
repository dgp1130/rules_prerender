# Style Entry Generator

Generates a CSS source file which imports all the styles in the given metadata
input. It effectively converts:

```jsonc
{
    // ...
    "styles": [
        { "path": "wksp/foo/bar/baz.css" },
        { "path": "wksp/hello/world.css" },
    ]
}
```

into:

```css
@import 'wksp/foo/bar/baz';
@import 'wksp/hello/world';
```

## Why not something simpler?

While the actual transformation can be easily done in Bash, we need to parse the
JSON input. This could probably be done with
[`jq`](https://stedolan.github.io/jq/), but integrating that into a Bazel
workspace is probably more effort than just writing a simple Node tool that does
the same thing.
