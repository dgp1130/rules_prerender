use std::collections::HashMap;
use std::fs;
use std::io;
use std::iter::zip;
use std::path::Path;
use parcel_css::bundler::{Bundler, FileProvider, SourceProvider};
use parcel_css::printer::PrinterOptions;
use parcel_css::stylesheet::ParserOptions;
use clap::Parser;

// TODO: Can `clap` support map arguments?
#[derive(Debug, Parser)]
struct Args {
    #[clap(short, long)]
    entry_point: Vec<String>,

    #[clap(short, long)]
    output: Vec<String>,

    #[clap(short, long)]
    import_path: Vec<String>,

    #[clap(short, long)]
    import_file: Vec<String>,

    #[clap(short, long)]
    workspace_name: String,
}

fn main() {
    let args = Args::parse();

    let import_map: HashMap<_, _> = zip(args.import_path, args.import_file).collect();
    let fs = BazelFileProvider::new(import_map);
    let mut bundler = Bundler::new(&fs, None, ParserOptions::default());

    for (entry_point, output) in zip(args.entry_point, args.output) {
        let stylesheet = bundler.bundle(&Path::new(&args.workspace_name).join(&entry_point)).unwrap();
        let css = stylesheet.to_css(PrinterOptions::default()).unwrap().code;
        fs::write(Path::new(&output), css).unwrap();
    }
}

struct BazelFileProvider {
    fs: FileProvider,
    import_map: HashMap<String, String>,
}

impl BazelFileProvider {
    pub fn new(import_map: HashMap<String, String>) -> BazelFileProvider {
        BazelFileProvider { fs: FileProvider::new(), import_map }
    }
}

impl SourceProvider for BazelFileProvider {
    fn read<'a>(&'a self, import_path: &Path) -> io::Result<&'a str> {
        let import_file = self.import_map.get(&normalize(import_path.to_str().unwrap()))
            .unwrap_or_else(|| panic!("Did not find {} in the import map\n{:?}", import_path.to_str().unwrap(), self.import_map));

        self.fs.read(&Path::new(import_file))
    }
}

// No equivalent of NodeJS' `path.normalize()` in Rust. Only `Path.canonicalize()`
// which actually reads the file system to get an absolute path,
fn normalize(path: &str) -> String {
    path.replace("./", "")
}
