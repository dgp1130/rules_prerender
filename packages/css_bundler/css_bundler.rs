use std::env;
use std::io;
use std::path::Path;
use std::process;
use parcel_css::bundler::{Bundler, FileProvider, SourceProvider};
use parcel_css::printer::PrinterOptions;
use parcel_css::stylesheet::ParserOptions;

fn main() {
    let args = parse_args(env::args().collect());

    let fs = BazelFileProvider::new();
    let mut bundler = Bundler::new(&fs, None, ParserOptions::default());
    let stylesheet = bundler.bundle(Path::new(&args.entry_point)).unwrap();
    let css = stylesheet.to_css(PrinterOptions::default()).unwrap().code;

    println!("{}", css);
}

struct BazelFileProvider {
    fs: FileProvider,
}

impl BazelFileProvider {
    pub fn new() -> BazelFileProvider {
        BazelFileProvider { fs: FileProvider::new() }
    }
}

impl SourceProvider for BazelFileProvider {
    fn read<'a>(&'a self, file: &Path) -> io::Result<&'a str> {
        self.fs.read(&file.with_extension("css2"))
    }
}

fn parse_args(args: Vec<String>) -> Args {
    if args.len() < 2 {
        eprintln!("Missing entry point argument.");
        process::exit(1);
    }
    let entry_point = &args[1];

    Args { entry_point: entry_point.to_string() }
}

struct Args {
    entry_point: String,
}
