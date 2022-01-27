extern crate serde_json;
extern crate tempdir;

use std::fs::File;
use std::env;
use std::error::Error;
use std::fmt;
use std::io;
use std::io::{Read, Write};
use std::path::Path;
use std::process::{Command, ExitStatus, Output as CommandOutput};
use tempdir::TempDir;
use prerender_metadata::{PrerenderMetadata, ScriptMetadata};

#[test]
fn generator_generates_entry_point() -> io::Result<()> {
    use_temp_dir(|temp_dir| {
        eprintln!("temp_dir: {}", temp_dir.display());

        let metadata = PrerenderMetadata {
            scripts: vec![
                ScriptMetadata { path: String::from("wksp/foo/bar/baz.js") },
                ScriptMetadata { path: String::from("wksp/hello/world.js") },
            ],
        };
        let metadata_json = serde_json::to_string_pretty(&metadata)?;
        let metadata_path = format!("{}/metadata.json", temp_dir.display());
        let mut metadata_file = File::create(&metadata_path)?;
        metadata_file.write_all(metadata_json.as_bytes())?;

        let output_path = format!("{}/output.js", temp_dir.display());
        run(&metadata_path, &output_path)?;
        
        let mut output_file = File::open(output_path)?;
        let mut output_contents = String::new();
        output_file.read_to_string(&mut output_contents)?;
        assert_eq!(output_contents, "
import 'wksp/foo/bar/baz.js';
import 'wksp/hello/world.js';
        ".trim());

        Ok(())
    })
}

#[test]
fn generator_generates_empty_entry_point() -> io::Result<()> {
    use_temp_dir(|temp_dir| {
        eprintln!("temp_dir: {}", temp_dir.display());

        let metadata = PrerenderMetadata { scripts: vec![] };
        let metadata_json = serde_json::to_string_pretty(&metadata)?;
        let metadata_path = format!("{}/metadata.json", temp_dir.display());
        let mut metadata_file = File::create(&metadata_path)?;
        metadata_file.write_all(metadata_json.as_bytes())?;

        let output_path = format!("{}/output.js", temp_dir.display());
        run(&metadata_path, &output_path)?;
        
        let mut output_file = File::open(output_path)?;
        let mut output_contents = String::new();
        output_file.read_to_string(&mut output_contents)?;
        assert_eq!(output_contents, "");

        Ok(())
    })
}

fn run(metadata_path: &String, output_path: &String) -> Result<CommandOutput, CommandFailedError> {
    let output = Command::new(get_entry_generator_path())
        .args([ "--metadata", &metadata_path ])
        .args([ "--output", &output_path ])
        .output()
        .expect("Failed to execute script_entry_generator.");

    if output.status.success() {
        Ok(output)
    } else {
        Err(CommandFailedError { status: output.status })
    }
}

#[derive(Clone, Debug)]
struct CommandFailedError {
    status: ExitStatus,
}

impl From<CommandFailedError> for io::Error {
    fn from(error: CommandFailedError) -> Self {
        io::Error::new(io::ErrorKind::Other, error)
    }
}

impl Error for CommandFailedError {}

impl fmt::Display for CommandFailedError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "Command failed with status: {}", self.status)
    }
}

fn get_entry_generator_path() -> String {
    static WORKSPACE: &str = "rules_prerender";
    static BINARY_PATH: &str = "packages/script_entry_generator_rs/script_entry_generator";
    let runfiles = env::var("RUNFILES_DIR").expect("${RUNFILES_DIR} not set.");

    format!("{}/{}/{}", runfiles, WORKSPACE, BINARY_PATH)
}

fn use_temp_dir<Callback: FnOnce(&Path) -> Result<(), io::Error>>(callback: Callback)
        -> io::Result<()> {
    let temp_dir = TempDir::new("tmp-test")?;
    let result = callback(temp_dir.path());
    let del_result = temp_dir.close();

    result.and(del_result)
}
