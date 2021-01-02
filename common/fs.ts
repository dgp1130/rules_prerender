import { promises as fs } from 'fs';

// Re-export `fs` functionality in a separate object that can be spied upon.
// Must manually re-export each specific member so they are imported in the same
// manner as the real `fs` module. Note that these are the promisified versions
// of the module.
export const {
    access,
    appendFile,
    chmod,
    chown,
    copyFile,
    lchmod,
    lchown,
    link,
    lstat,
    mkdir,
    mkdtemp,
    open,
    readdir,
    readFile,
    readlink,
    realpath,
    rename,
    rmdir,
    stat,
    symlink,
    truncate,
    unlink,
    utimes,
    writeFile,
} = fs;
