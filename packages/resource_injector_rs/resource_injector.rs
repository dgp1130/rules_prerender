extern crate clap;

use std::error::Error;
use clap::{App, arg};

fn main() -> Result<(), Box<dyn Error>> {
    let matches = App::new("resource_injector")
        .about("Injects web resources into a HTML files.")
        .arg(arg!(--"input-dir" <INPUT_DIR> "Directory containing input resources"))
        .arg(arg!(--config <CONFIG> "Configuration file indicating the resources to inject"))
        .arg(arg!(--bundle <BUNDLE> "An optional JavaScript bundle to inject").required(false))
        .arg(arg!(--"output-dir" <OUTPUT_DIR> "Directory to output injected resources to"))
        .get_matches();

    let input_dir = matches.value_of("input-dir").unwrap();
    let config = matches.value_of("config").unwrap();
    let bundle = matches.value_of("bundle");
    let output_dir = matches.value_of("output-dir").unwrap();

    println!("Injecting from {} to {} with config {} and bundle {:?}.", &input_dir, &output_dir, &config, &bundle);

    Ok(())
}
