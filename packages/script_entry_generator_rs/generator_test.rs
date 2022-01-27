use prerender_metadata::{PrerenderMetadata, ScriptMetadata};
use generator::generate_entry_point;

#[test]
fn generate_entry_point_generates_from_metadata() {
    let metadata = PrerenderMetadata {
        scripts: vec![
            ScriptMetadata { path: String::from("foo/bar/baz.js") },
            ScriptMetadata { path: String::from("hello/world.js") },
        ],
    };

    let entry_point = generate_entry_point(metadata);

    assert_eq!(entry_point, "
import 'foo/bar/baz.js';
import 'hello/world.js';
    ".trim());
}

#[test]
fn generate_entry_point_generates_from_empty_metadata() {
    let metadata = PrerenderMetadata {
        scripts: vec![],
    };

    let entry_point = generate_entry_point(metadata);

    assert_eq!(entry_point, "");
}