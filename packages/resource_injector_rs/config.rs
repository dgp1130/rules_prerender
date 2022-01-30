extern crate serde;

use serde::{Deserialize, Serialize};

pub type InjectorConfig = Vec<InjectorAction>;

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "type")]
pub enum InjectorAction {
    #[serde(rename = "script")]
    Script { path: String },

    #[serde(rename = "style")]
    Style { path: String },
}
