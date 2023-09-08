import { promises as fs } from 'fs';
import { marked } from 'marked';
import * as path from 'path';
import grayMatter from 'gray-matter';
import { SafeHtml, unsafeTreatStringAsSafeHtml } from 'rules_prerender';

/**
 * Represents a markdown file which has been parsed into HTML. Includes
 * frontmatter content without any schema or assumptions applied.
 */
export interface ParsedMarkdown {
    /** Frontmatter from the markdown file. */
    frontmatter: Record<string, unknown>;

    /** HTML content of the markdown file. */
    html: SafeHtml;
}

/**
 * Reads the page given as a runfiles path and parses it as markdown, returning
 * the HTML and frontmatter.
 *
 * @param page A runfiles-relative path to the markdown file to render.
 * @returns The parsed markdown frontmatter and HTML content.
 */
export async function renderMarkdown(page: string): Promise<ParsedMarkdown> {
    const runfiles = process.env['RUNFILES'];
    if (!runfiles) throw new Error('`${RUNFILES}` not set.');

    // Constrain this functionality to `*.md` files to reduce risk of misuse or
    // insecure usage.
    if (!page.endsWith('.md')) {
        throw new Error(`Markdown files *must* use the \`.md\` file extension.`);
    }

    // Read markdown from runfiles.
    let md: string;
    try {
        md = await fs.readFile(path.join(runfiles, page), 'utf8');
    } catch (err: any) {
        if (err.code === 'ENOENT') {
            throw new Error(`Failed to read markdown file. Was it included as a \`data\` dependency?\n${err.message}`);
        } else {
            throw err;
        }
    }

    // Extract frontmatter from markdown files.
    const { content, data } = grayMatter(md);

    // Convert markdown to HTML. The HTML content comes directly from markdown
    // file in runfiles, so we can be fairly confident this is a source file or
    // built from source with no user input.
    const html = unsafeTreatStringAsSafeHtml(await marked(content, {
        async: true,
    }));

    return { frontmatter: data, html };
}
