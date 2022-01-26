extern crate serde;

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct PrerenderMetadata {
    pub scripts: Vec<ScriptMetadata>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ScriptMetadata {
    pub path: String,
}