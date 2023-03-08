import { RenderResult, render } from '@lit-labs/ssr';
import { TemplateResult, html } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import * as rulesPrerender from 'rules_prerender';

/** Re-export common symbols from `lit-html` for convenience. */
export { TemplateResult, html } from 'lit-html';

/** Re-export common symbols from `rules_prerender` for convenience. */
export { PrerenderResource } from 'rules_prerender';

/** Renders the given Lit template to {@link SafeHtml}. */
export async function renderToHtml(template: TemplateResult):
        Promise<rulesPrerender.SafeHtml> {
    const rendered = await collectResult(render(template));
    return rulesPrerender.unsafeTreatStringAsSafeHtml(rendered);
}

/** Wraps {@link rulesPrerender.includeScript} in a {@link TemplateResult}. */
export function includeScript(path: string, meta: ImportMeta): TemplateResult {
    return html`${unsafeHTML(rulesPrerender.includeScript(path, meta))}`;
}

/** Wraps {@link rulesPrerender.inlineStyle} in a {@link TemplateResult}. */
export function inlineStyle(path: string, meta: ImportMeta): TemplateResult {
    return html`${unsafeHTML(rulesPrerender.inlineStyle(path, meta))}`;
}

/** Forked from https://github.com/lit/lit/blob/cabc61894e57ba89ecadc1deb20f121fecdfffc9/packages/labs/ssr/src/lib/render-result.ts#L22-L32 */
async function collectResult(result: RenderResult): Promise<string> {
    let value = '';
    for (const chunk of result) {
        value += typeof chunk === 'string'
            ? chunk
            : await collectResult(await chunk);
    }
    return value;
};
