extern crate clap;
extern crate serde;
extern crate serde_json;

use std::fs;
use clap::{App, arg};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
struct PrerenderMetadata {
    scripts: Vec<ScriptMetadata>,
}

#[derive(Serialize, Deserialize, Debug)]
struct ScriptMetadata {
    path: String,
}

fn main() {
    // Parse arguments.
    let matches = App::new("script_entry_generator")
        .about("Generates an entry point for web scripts.")
        .arg(arg!(--metadata <METADATA>))
        .arg(arg!(--output <OUTPUT>))
        .get_matches();
    let metadata_path = matches.value_of("metadata").expect("--metadata is required.");
    let output_path = matches.value_of("output").expect("--output is required.");

    // Parse metadata from JSON.
    let metadata_json = fs::read_to_string(metadata_path)
        .expect(&format!("Failed to read metadata file: {}", metadata_path));
    let metadata: PrerenderMetadata = serde_json::from_str(&metadata_json)
        .expect(&format!("Failed to parse PrerenderMetadata from JSON file: {}", metadata_path));

    println!("Generating {} from:\n{:?}", output_path, metadata);
}
