import { promises as fs } from 'fs';

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
     * Reads a file at the given path and returns it as a UTF8-encoded string or
     * a binary buffer.
     */
    readFile(path: string, options: 'utf8'): Promise<string>;
    readFile(path: string, options: { encoding: 'utf8' }): Promise<string>;
    readFile(path: string, options?: string | { encoding?: string }):
        Promise<string | Buffer>;
}

/** A file system implemented with the Node.js `fs` APIs. */
class DiskFs implements FileSystem {
    public async copyFile(src: string, dest: string): Promise<void> {
        await fs.copyFile(src, dest);
    }

    public async mkdir(dir: string, options?: { recursive?: boolean }):
            Promise<void> {
        await fs.mkdir(dir, options);
    }

    readFile(path: string, options: 'utf8'): Promise<string>;
    readFile(path: string, options: { encoding: 'utf8' }): Promise<string>;
    readFile(path: string, options?: string | { encoding?: string }):
        Promise<string | Buffer>;
    public async readFile(path: string, options?: 'utf8' | { encoding?: string }):
            Promise<string | Buffer> {
        return await fs.readFile(
            path,
            options as any,
        ) as unknown as Promise<string | Buffer>;
    }
}

/** Singleton instance of the real disk file system. */
export const diskFs = new DiskFs();
