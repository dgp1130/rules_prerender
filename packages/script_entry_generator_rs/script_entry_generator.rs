extern crate clap;
extern crate serde_json;

use std::fs;
use clap::{App, arg};

use prerender_metadata::PrerenderMetadata;

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

    // Generate an entry point from prerender metadata.
    let entry_point_content = generator::generate_entry_point(metadata);

    // Write the entry point to the output file.
    fs::write(output_path, entry_point_content)
        .expect(&format!("Failed to write to output file: {}", output_path));
}
