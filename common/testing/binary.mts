/** @fileoverview Utilities related to testing executable files. */

import { execFile as execFileCb } from 'child_process';
import { promisify } from 'util';

const execFile = promisify(execFileCb);

/** The result of a child process execution. */
export interface ProcessResult {
    /**
     * The status code the binary exited with.
     * @see https://en.wikipedia.org/wiki/Exit_status
     */
    code: number;

    /**
     * The content printed to stdout.
     * @see https://en.wikipedia.org/wiki/Standard_streams
     */
    stdout: string;

    /**
     * The content printed to stderr.
     * @see https://en.wikipedia.org/wiki/Standard_streams
     */
    stderr: string;
}

/**
 * Executes the given binary file with the provided arguments. This is mainly
 * useful for testing binaries by simply executing them, waiting for them to
 * finish and then verifying the outputs.
 * 
 * @param binary The path to a binary file to execute.
 * @param args The arguments to pass in to the binary.
 * @return The exit code the binary completed with and the data it wrote to
 *     stdout and stderr.
 */
export async function execBinary(binary: string, args?: string[]):
        Promise<ProcessResult> {
    try {
        const { stdout, stderr } = await execFile(binary, args);
        return { code: 0, stdout, stderr };
    } catch (err) {
        // The error object thrown has the relevant data on it.
        const { code, stdout, stderr } = err as ChildProcessError;
        return { code, stdout, stderr };
    }
}

/**
 * Node consistently throws an error of this structure, but it is not an
 * official type.
 */
interface ChildProcessError {
    code: number;
    stdout: string;
    stderr: string;
}
