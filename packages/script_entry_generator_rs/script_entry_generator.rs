extern crate clap;

use clap::{App, arg};

fn main() {
    let matches = App::new("script_entry_generator")
        .about("Generates an entry point for web scripts.")
        .arg(arg!(--metadata <METADATA>))
        .arg(arg!(--output <OUTPUT>))
        .get_matches();

    let metadata_path = matches.value_of("metadata").expect("--metadata is required.");
    let output_path = matches.value_of("output").expect("--output is required.");

    println!("Generating {} from {}.", output_path, metadata_path);
}
