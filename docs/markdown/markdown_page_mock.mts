/**
 * @fileoverview Mocks file with functions for creating mock objects for
 * markdown data structures.
 */

import { SafeHtml, safe } from 'rules_prerender';
import { MarkdownMetadata, MarkdownPage } from './markdown_page.mjs';

/** Mocks a {@link MarkdownPage} object with defaults. */
export function mockMarkdownPage({ metadata, html }: {
    metadata?: MarkdownMetadata,
    html?: SafeHtml,
} = {}): MarkdownPage {
    return {
        metadata: mockMarkdownMetadata(metadata),
        html: html ?? safe`<button>Mocked HTML.</button>`,
    };
}

/** Mocks a {@link MarkdownMetadata} object with defaults. */
export function mockMarkdownMetadata({ title }: { title?: string } = {}):
        MarkdownMetadata {
    return {
        title: title ?? 'An interesting post',
    };
}
