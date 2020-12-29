# Entry Generator

Generates a TypeScript source file which imports all the scripts in the given
metadata input. It effective converts:

```jsonc
{
    // ...
    "scripts": [
        { "path": "wksp/foo/bar/baz" },
        { "path": "wksp/hello/world" },
    ]
}
```

into:

```typescript
import 'wksp/foo/bar/baz';
import 'wksp/hello/world';
```

## Why not something simpler?

While the actual transformation can be easily done in Bash, we need to parse the
JSON input. This could probably be done with
[`jq`](https://stedolan.github.io/jq/), but integrating that into a Bazel
workspace is probably more effort than just writing a simple Node tool that does
the same thing.
