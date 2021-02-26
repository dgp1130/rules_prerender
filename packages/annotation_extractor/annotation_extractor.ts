import { promises as fs } from 'fs';
import * as yargs from 'yargs';
import * as path from 'path';
import { main } from '../../common/binary.js';
import { mdSpacing } from '../../common/formatters.js';
import { extract } from '../../packages/annotation_extractor/extractor.js';
import { assembleMetadata } from '../../packages/annotation_extractor/metadata.js';
import { PrerenderAnnotation, annotationsEqual } from '../../common/models/prerender_annotation.js';
import { unique } from '../../common/collections.js';

main(async () => {
    const {
        'input-dir': inputDir,
        'output-dir': outputDir,
        'output-metadata': outputMetadata,
    } = yargs
        .usage(mdSpacing(`
            Extracts annotations from the all HTML files in the given directory.
            Outputs the input HTML files with the annotations removed to the
            given output directory. Non-HTML files are copied over to the output
            directory unchanged. All files from the input directory are written
            to the output directory at the same relative path. A JSON file
            containing the extracted from input HTML files is generated at the
            output metadata path.
        `))
        .option('input-dir', {
            type: 'string',
            required: true,
            description: mdSpacing(`
                The input directory of files to extract annotations from. Files
                ending in \`.html\` have annotations extracted.
            `),
        })
        .option('output-dir', {
            type: 'string',
            required: true,
            description: mdSpacing(`
                The directory to write output files to. Will be identical to the
                input directory, except that all HTML files will have
                annotations removed.
            `),
        })
        .option('output-metadata', {
            type: 'string',
            required: true,
            description: mdSpacing(`
                The output JSON file to write metadata to. Will contain all
                extracted annotations in the \`PrerenderMetadata\` format.
            `),
        })
        .argv;

    const annotations = [] as Array<PrerenderAnnotation>;
    const outputWrites = [] as Array<Promise<void>>;
    for await (const relPath of listRecursiveFiles(inputDir)) {
        // Ignore non-HTML files by simply copying them to the output directory.
        if (!relPath.endsWith('.html')) {
            // Don't `await` this directly in the `for-await` loop or each copy will
            // be done sequentially. Instead, we start the copy operation but don't
            // block on it to start processing the next file. Only at the end do we
            // wait for all file write/copy operations to complete.
            outputWrites.push((async () => {
                const inputPath = path.join(inputDir, relPath);
                const outputPath = path.join(outputDir, relPath);
                await mkParentDir(outputPath);
                await fs.copyFile(inputPath, outputPath);
            })());
            continue;
        }

        const contents = await fs.readFile(path.join(inputDir, relPath), {
            encoding: 'utf8',
        });

        // Extract annotations from the HTML.
        const [ outputHtml, newAnnotations ] = extract(contents);
        annotations.push(...newAnnotations);
    
        // Write the output HTML file to disk. Don't `await` these directly in
        // the `for-await` loop or each write will be done sequentially.
        // Instead, we start the write operation but don't block on it to start
        // processing the next file. Only at the end do we wait for all HTML
        // write operations to complete.
        outputWrites.push((async () => {
            const outputHtmlPath = path.join(outputDir, relPath);
            await mkParentDir(outputHtmlPath);
            await fs.writeFile(outputHtmlPath, outputHtml);
        })());
    }

    // Assemble annotations into the metadata format.
    const metadata = assembleMetadata(unique(annotations, annotationsEqual));

    // Write output HTML and metadata JSON.
    const metadataOutput =
            JSON.stringify(metadata, null /* replacer */, 4 /* tabSize */)
            + `\n` /* trailing newline */;
    const metadataWrite = fs.writeFile(outputMetadata, metadataOutput);

    // Wait for all file write operations to complete.
    await Promise.all([
        ...outputWrites,
        metadataWrite,
    ]);

    return 0;
});

/**
 * Yields all the relative paths to files recursively in the given directory.
 * 
 * @param dir The directory to list files within.
 * @yields The relative path of each file recursively in {@param dir}.
 */
function listRecursiveFiles(dir: string): AsyncIterable<string> {
    /** Define recursive implementation. */
    async function* listRecursiveFilesImpl(relPath: string):
            AsyncIterable<string> {
        const contents = await fs.readdir(path.join(dir, relPath), {
            withFileTypes: true,
        });
        for (const item of contents) {
            const itemPath = path.join(relPath, item.name);
            if (item.isDirectory()) {
                yield* listRecursiveFilesImpl(itemPath);
            } else {
                yield itemPath;
            }
        }
    }

    return listRecursiveFilesImpl(''); // Start the recursion.
}

/** Recursively creates the parent directories of the given path. */
async function mkParentDir(path: string): Promise<void> {
    const parentDir = path.split('/').slice(0, -1).join('/');
    await fs.mkdir(parentDir, { recursive: true });
}
