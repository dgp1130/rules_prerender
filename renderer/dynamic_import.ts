/** A wrapper of the keyword `import()` to allow easy mocking for tests. */
export async function dynamicImport(module: string): Promise<unknown> {
    return await import(module);
}
