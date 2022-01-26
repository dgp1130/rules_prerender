use prerender_metadata::PrerenderMetadata;

/** Generates a script entry point for the given prerender metadata. */
pub fn generate_entry_point(metadata: PrerenderMetadata) -> String {
    metadata.scripts.into_iter()
        .map(|script| format!("import '{}';", script.path))
        .collect::<Vec<String>>()
        .join("\n")
}
