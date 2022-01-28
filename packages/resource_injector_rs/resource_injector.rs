extern crate async_recursion;
extern crate clap;
extern crate futures;
extern crate tokio;

use std::error::Error;
use std::path::{Path, PathBuf};
use async_recursion::async_recursion;
use clap::{App, arg};
use tokio::fs;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let matches = App::new("resource_injector")
        .about("Injects web resources into a HTML files.")
        .arg(arg!(--"input-dir" <INPUT_DIR> "Directory containing input resources"))
        .arg(arg!(--config <CONFIG> "Configuration file indicating the resources to inject"))
        .arg(arg!(--bundle <BUNDLE> "An optional JavaScript bundle to inject").required(false))
        .arg(arg!(--"output-dir" <OUTPUT_DIR> "Directory to output injected resources to"))
        .get_matches();

    let input_dir_path = matches.value_of("input-dir").unwrap();
    let config_path = matches.value_of("config").unwrap();
    let bundle_path = matches.value_of("bundle");
    let output_dir_path = matches.value_of("output-dir").unwrap();

    println!("Injecting from {} to {} with config {} and bundle {:?}.", &input_dir_path, &output_dir_path, &config_path, &bundle_path);

    let config = fs::read(config_path).await?;
    println!("Config: {}", String::from_utf8_lossy(&config));

    let files = list_recursive_files(&Path::new(input_dir_path)).await?;
    println!("Input files:");
    for file in files {
        println!("{}", file.to_str().unwrap());
    }

    Ok(())
}

/** Returns a Vector of paths for all the files recursively under the given root path. */
#[async_recursion]
async fn list_recursive_files(root: &Path) -> Result<Vec<PathBuf>, Box<dyn Error>> {
    let mut results = Vec::<PathBuf>::new();
    let mut entries = fs::read_dir(root).await?;
    while let Some(entry) = entries.next_entry().await? {
        let rel_path = Path::new(root).join(entry.file_name().into_string().unwrap());
        if entry.file_type().await?.is_dir() {
            results.append(&mut list_recursive_files(&rel_path).await?);
        } else {
            results.push(rel_path);
        }
    }

    Ok(results)
}
