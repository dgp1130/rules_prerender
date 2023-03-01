import { promises as fs } from 'fs';
import { ResourceMap } from './resource_map.mjs';

/**
 * Loads the given directory and returns a {@link ResourceMap} of all its
 * contents. All URL paths are relative to {@param root}.
 * 
 * @param root The directory to load into a {@link ResourceMap}.
 * @returns The {@link ResourceMap} with all the contents of the directory.
 */
export async function loadPackage(root: string): Promise<ResourceMap> {
    const contents = await fs.readdir(root, { withFileTypes: true });

    // Create a `ResourceMap` from all the files in the directory.
    const filesPackage = ResourceMap.fromEntries(
        contents.filter((item) => item.isFile())
            .map((file) => [
                `/${file.name}`, // urlPath
                `${root}/${file.name}`, // fileRef
            ]),
    );

    // Recursively create a `ResourceMap` for each subdirectory.
    const subDirectories = contents.filter((item) => item.isDirectory())
        .map((subDir) => subDir.name);
    const subPackages = await Promise.all(
        // Recursively load the subdirectory and re-root it at its name.
        subDirectories.map((subDir) => loadPackage(`${root}/${subDir}`)
            .then((pkg) => ResourceMap.reRoot(`/${subDir}`, pkg))),
    );
    
    // Merge all the `ResourceMap` objects together into a single package.
    return ResourceMap.merge(filesPackage, ...subPackages);
}
