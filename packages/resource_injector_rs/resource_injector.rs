extern crate async_recursion;
extern crate clap;
extern crate futures;
extern crate serde_json;
extern crate tokio;

use std::error::Error;
use std::fmt::{Display, Formatter};
use std::iter;
use std::path::{Path, PathBuf};
use std::pin::Pin;
use futures::FutureExt;
use futures::future::{Future, try_join_all};
use async_recursion::async_recursion;
use clap::{App, arg};
use tokio::fs;
use config::{InjectorAction, InjectorConfig};
use injector::inject;

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

    eprintln!("Injecting from {} to {} with config {} and bundle {:?}.", &input_dir_path, &output_dir_path, &config_path, &bundle_path);

    // Copy files from input directory to output directory.
    let relative_paths = list_recursive_files(&Path::new(input_dir_path), Path::new("")).await?;
    try_join_all(relative_paths.into_iter().map(move |rel_path| -> Pin<Box<dyn Future<Output = Result<(), Box<dyn Error>>>>> {
        let input_file = Path::new(input_dir_path).join(&rel_path);
        let output_file = Path::new(output_dir_path).join(&rel_path);
        let output_dir = output_file.parent().unwrap().to_owned();

        // Create parent directories if necessary and then copy the file.
        Box::pin(fs::create_dir_all(output_dir).then(move |_| -> Pin<Box<dyn Future<Output = Result<(), Box<dyn Error>>>>> {
            let extension = &input_file.extension().and_then(|ext| ext.to_str());
            if let Some("html") = extension {
                Box::pin(async move {
                    // Get the config to inject the HTML with.
                    // TODO: Only read config once. Read in parallel with HTML.
                    let input_config = read_config(&config_path).await?;
                    let config = if let Some(bundle) = bundle_path {
                        let sibling_js_path = &rel_path.with_extension("js");
                        let sibling_js = sibling_js_path.to_owned().into_os_string().into_string().unwrap();
                        let config = input_config.into_iter()
                            .chain(iter::once(InjectorAction::Script {
                                path: format!("/{}", sibling_js),
                            }))
                            .collect()
                        ;

                        // Copy JavaScript bundle to output HTML location, but with a `.js` extension.
                        fs::copy(&bundle, Path::new(&output_dir_path).join(&sibling_js)).await?;

                        config
                    } else {
                        input_config
                    };

                    // Read the HTML, inject it, and write the output.
                    let html = fs::read_to_string(input_file).await?;
                    let injected = inject(html, config).await?;
                    fs::write(output_file, injected).await?;
                    Ok(())
                })
            } else {
                Box::pin(fs::copy(input_file, output_file).map(|_| Ok(())))
            }
        }))
    })).await?;

    Ok(())
}

/** Reads and parses the config file at the given path. */
async fn read_config(config_path: &str) -> Result<InjectorConfig, Box<dyn Error>> {
    let config_contents = fs::read_to_string(config_path).await?;
    serde_json::from_str::<InjectorConfig>(&config_contents).or(Err(Box::new(JsonParseError {
        raw: config_contents.clone(),
    })))
}

/** Error representing a failed JSON parsing. */
#[derive(Debug)]
struct JsonParseError {
    raw: String,
}
impl Error for JsonParseError {}
impl Display for JsonParseError {
    fn fmt(&self, f: &mut Formatter) -> Result<(), std::fmt::Error> {
        write!(f, "Failed to parse JSON:\n{}", self.raw)
    }
}

/** Returns a Vector of paths for all the files recursively under the given root path. */
#[async_recursion]
async fn list_recursive_files(root: &Path, parents: &Path) -> Result<Vec<PathBuf>, Box<dyn Error>> {
    let mut results = Vec::<PathBuf>::new();
    let mut entries = fs::read_dir(root.join(parents)).await?;
    while let Some(entry) = entries.next_entry().await? {
        let rel_path = Path::new(parents).join(entry.file_name().into_string().unwrap());
        if entry.file_type().await?.is_dir() {
            results.append(&mut list_recursive_files(&root, &rel_path).await?);
        } else {
            results.push(rel_path);
        }
    }

    Ok(results)
}
