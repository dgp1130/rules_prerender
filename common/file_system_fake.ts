import * as path from 'path';
import { FileSystem } from './file_system';

/**
 * A fake implementation of the `FileSystem` interface which stores everything
 * in memory.
 */
export class FileSystemFake implements FileSystem {
    private fs: Map<string, string | Buffer>;

    private constructor({ fs }: { fs: Map<string, string | Buffer> }) {
        this.fs = fs;
    }

    public static of(fs: Record<string, string | Buffer>): FileSystemFake {
        return new FileSystemFake({
            fs: new Map(Object.entries(fs)),
        });
    }

    public async copyFile(inputSrc: string, inputDest: string): Promise<void> {
        const src = path.normalize(inputSrc);
        const dest = path.normalize(inputDest);

        const contents = this.fs.get(src);
        if (!contents) throw new Error(`Attempted to copy non-existent file "${src}", normalized from "${inputSrc}".`);
        this.fs.set(dest, contents);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async mkdir(_dir: string, _options?: { recursive?: boolean }):
            Promise<void> {
        // Nothing to do.
    }

    readFile(path: string, options: 'utf8'): Promise<string>;
    readFile(path: string, options: { encoding: 'utf8' }): Promise<string>;
    readFile(path: string, options?: string | { encoding?: string }):
        Promise<string | Buffer>;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async readFile(inputPath: string, _options?: string | { encoding?: string }): Promise<string | Buffer> {
        const filePath = path.normalize(inputPath);
        const content = this.fs.get(filePath);
        if (!content) {
            const availableFiles = Array.from(this.fs.entries()).join('\n');
            throw new Error(`File path not found. "${inputPath}" normalized to "${
                filePath}". Available files are:\n${availableFiles}`);
        }

        return content;
    }
}
