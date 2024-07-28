import { SafeHtml } from 'rules_prerender';
import { z } from 'zod';

/**
 * Represents a parsed markdown page including frontmatter metadata and raw
 * HTML content.
 */
export interface MarkdownPage {
    metadata: MarkdownMetadata;
    html: SafeHtml;
}

/**
 * Represents the metadata of a markdown page. Most of this comes from
 * frontmatter, but some may come from processing of the markdown contents.
 */
export type MarkdownMetadata = z.infer<typeof pageMetadataSchema>;

// Validates markdown page frontmatter.
const pageMetadataSchema = z.strictObject({
    title: z.string(),
});

/**
 * Validates the given frontmatter and asserts that it matches page metadata
 * schema.
 */
export function parsePageMetadata(page: string, frontmatter: unknown): MarkdownMetadata {
    const result = pageMetadataSchema.safeParse(frontmatter);
    if (result.success) return result.data;

    // `formErrors` are errors on the root object (ex. parsing `null` directly).
    // `fieldErrors` are errors for fields of the object and sub-objects.
    const { formErrors, fieldErrors } = result.error.flatten();
    const formErrorsMessage = formErrors.join('\n');
    const fieldErrorsMessage = Object.entries(fieldErrors)
        .map(([ field, errors ]) => `Property \`${field}\`:\n${
            errors.join('\n')}`)
        .join('\n\n');
    const errorMessage = formErrorsMessage !== ''
        ? `${formErrorsMessage}\n${fieldErrorsMessage}`
        : fieldErrorsMessage;

    throw new Error(`Error processing markdown frontmatter for page \`${
        page}\`:\n${errorMessage}`);
}
