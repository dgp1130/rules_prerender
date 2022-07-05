/** @fileoverview Functions related to formatting text. */

/**
 * Formats the given text like markdown. Adjacent lines are considered part of
 * the same paragraph and the newline between them is replaced by a space. Every
 * line is trimmed so they can be indented in source but still have reasonable
 * output. Lines with more than one newline between them are considered distinct
 * paragraphs and simplified to use exactly two newlines between them. This is
 * useful for formatting docs and user visible strings to look reasonable to
 * users viewing them as simple text on a terminal, but also be convenient to
 * write inline in TypeScript.
 * 
 * Example:
 * 
 * ```typescript
 * import { mdSpacing } from '.../formatters';
 * 
 * function doSomething() {
 *     console.log(mdSpacing(`
 *         This is some long text. It is indented like code, and is very long
 *         but I can add newlines wherever I want and it will still display
 *         reasonably to users.
 * 
 *         Separate paragraphs can just use two newlines.
 *     `));
 * }
 * ```
 * 
 * This will display to the user as (and will line wrap according to their UI):
 * 
 * ```
 * This is some long text. It is indented like code, and is very long but I can add newlines wherever I want and it will still display reasonably to users.
 * 
 * Separate paragraphs can just use two newlines.
 * ```
 * 
 * @param content The text content to reformat like markdown.
 * @return The input string with spacing like markdown.
 */
export function mdSpacing(content: string): string {
    const paragraphs = content.trim().split(/\n{2,}/);
    return paragraphs.map((paragraph) => paragraph.trim().split('\n')
        .map((line) => line.trim())
        .join(' '),
    ).join('\n\n');
}
