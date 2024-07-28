import * as fs from 'fs';

/**
 * A simplified file system interface, based on the NodeJs `fs` module with
 * more limited features. This allows it to be easily implemented in multiple
 * ways without pulling in all the complexity of the `fs` module's contracts.
 */
export interface FileSystem {
    /** Copies a file from the source to the destination. */
    copyFile(src: string, dest: string): Promise<void>;

    /**
     * Creates a new directory at the given location. Optionally creates all the
     * parents of the directory.
     */
    mkdir(dir: string, options?: { recursive?: boolean }): Promise<void>;

    /**
     * Reads a file at the given path and returns it as a UTF8-encoded string.
     */
    readFile(path: string, options: 'utf8' | { encoding: 'utf8' }):
        Promise<string>;

    /**
     * Reads a file at the given path and returns it as a UTF8-encoded string or
     * a binary buffer.
     */
    readFile(path: string, options?: string | { encoding?: string }):
        Promise<string | Buffer>;

    /**
     * Reads a file at the given path and returns it as a UTF8-encoded string.
     *
     * @deprecated Prefer the asynchronous {@link readFile}.
     */
    readFileSync(path: string, options: 'utf8' | { encoding: 'utf8' }): string;

    /**
     * Reads a file at the given path and returns it as a UTF8-encoded string or
     * a binary buffer.
     *
     * @deprecated Prefer the asynchronous {@link readFile}.
     */
    readFileSync(path: string, options?: string | { encoding?: string }):
        string | Buffer;
}

/** A file system implemented with the Node.js `fs` APIs. */
class DiskFs implements FileSystem {
    public async copyFile(src: string, dest: string): Promise<void> {
        await fs.promises.copyFile(src, dest);
    }

    public async mkdir(dir: string, options?: { recursive?: boolean }):
            Promise<void> {
        await fs.promises.mkdir(dir, options);
    }

    readFile(path: string, options: 'utf8' | { encoding: 'utf8' }):
        Promise<string>;
    readFile(path: string, options?: string | { encoding?: string }):
        Promise<string | Buffer>;
    public async readFile(
        path: string,
        options?: string | { encoding?: string },
    ): Promise<string | Buffer> {
        return await fs.promises.readFile(
            path,
            options as any,
        ) as unknown as Promise<string | Buffer>;
    }

    readFileSync(path: string, options: 'utf8' | { encoding: 'utf8' }): string;
    readFileSync(path: string, options?: string | { encoding?: string }):
        string | Buffer;
    public readFileSync(path: string, options?: 'utf8' | { encoding?: string }):
            string | Buffer {
        return fs.readFileSync(path, options as any);
    }
}

/** Singleton instance of the real disk file system. */
export const diskFs = new DiskFs();
