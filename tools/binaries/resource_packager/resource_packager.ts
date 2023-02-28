import yargs from 'yargs';
import { main } from '../../../common/binary';
import { mdSpacing } from '../../../common/formatters';
import { pack } from './packager';
import { ResourceMap } from './resource_map';
import { loadPackage } from './package_loader';

main(async (args) => {
    const {
        'url-path': urlPaths,
        'file-ref': fileRefs,
        'merge-dir': mergeDirs,
        'dest-dir': destDir,
    } = yargs(process.argv.slice(2))
        .usage(mdSpacing(`
            Packages all the given resources (file references) by moving them to
            their associated URL path relative to the destination directory.
            \`--url-path\` and \`--file-ref\` must be set the same number of
            times. The first file reference will be copied to the first URL path
            within the destination directory, and so on for each pair.

            Any directories given with \`--merge-dir\` are copied into the
            destination directory. If there is a path conflict, the tool aborts
            with exit code 1.
        `) + '\n\n' + `
Example:

\`\`\`shell
./$0 --url-path /foo.txt --file-ref bazel-bin/pkg/foo.txt \\
    --url-path /some/dir/bar.txt --file-ref bazel-bin/pkg/baz.txt \\
    --dest-dir bazel-bin/output
\`\`\`

Is equivalent to:

\`\`\`shell
cp bazel-bin/pkg/foo.txt bazel-bin/output/foo.txt
mkdir -p bazel-out/output/some/dir/
cp bazel-bin/pkg/baz.txt bazel-bin/output/some/dir/baz.txt
\`\`\`
        `.trim())
        .option('url-path', {
            type: 'array',
            default: [] as string[],
            description: mdSpacing(`
                A list of URL paths to combine with file references. Each path
                is the location its corresponding file reference is copied to
                (relative to the destination directory). Must start with a
                slash, as this is intended to represent an absolute URL path.
            `),
        })
        .option('file-ref', {
            type: 'array',
            default: [] as string[],
            description: mdSpacing(`
                A list of file references (paths to Bazel files) to combine with
                URL paths. Each file reference holds the contents which are
                copied to its corresponding URL path (relative to the
                destination directory).
            `),
        })
        .option('merge-dir', {
            type: 'array',
            default: [] as string[],
            description: mdSpacing(`
                Directories to merge into the final output directory. Exits with
                code 1 if there is a conflict from multiple directories using
                the same URL path.
            `),
        })
        .option('dest-dir', {
            type: 'string',
            demandOption: true,
            description: mdSpacing(`
                Destination directory to write outputs to.
            `),
        })
        .parse(args);

    if (urlPaths.length !== fileRefs.length) {
        console.error(mdSpacing(`
            Number of \`--url-path\` and \`--file-ref\` flags should be the
            same, got ${urlPaths.length} \`--url-path\` flag(s) and
            ${fileRefs.length} \`--file-ref\` flag(s).
        `));
        return 1;
    }

    // Build a map from the given inputs.
    const entries = ResourceMap.fromEntries(zip(urlPaths, fileRefs));

    // Load all dependent packages.
    const deps = await Promise.all(mergeDirs.map((dir) => loadPackage(dir)));

    // Merge everything together.
    const merged = ResourceMap.merge(entries, ...deps);

    // Write to output directory.
    await pack(destDir, merged);

    return 0;
});

/**
 * Given two arrays, returns an {@link Iterable} of pairs of the same index.
 * Assumes the two inputs have the same number of items.
 */
function* zip<First, Second>(firsts: First[], seconds: Second[]):
        Iterable<[ First, Second ]> {
    if (firsts.length !== seconds.length) {
        throw new Error(`Zipped arrays must be the same length, got:\n${
            firsts.join(', ')}\n\n${seconds.join(', ')}`);
    }
    for (const [ index, first ] of firsts.entries()) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const second = seconds[index]!;
        yield [ first, second ];
    }
}
