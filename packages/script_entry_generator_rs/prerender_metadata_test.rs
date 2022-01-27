use prerender_metadata::{PrerenderMetadata, ScriptMetadata};

#[test]
fn prerender_metadata() {
    let metadata = PrerenderMetadata {
        scripts: vec![
            ScriptMetadata { path: String::from("foo/bar/baz.js") },
            ScriptMetadata { path: String::from("hello/world.js") },
        ],
    };

    assert_eq!(metadata.scripts.len(), 2);
    assert_eq!(metadata.scripts[0].path, "foo/bar/baz.js");
    assert_eq!(metadata.scripts[1].path, "hello/world.js");
}

#[test]
fn script_metadata() {
    let metadata = ScriptMetadata { path: String::from("foo/bar/baz.js") };

    assert_eq!(metadata.path, "foo/bar/baz.js");
}
