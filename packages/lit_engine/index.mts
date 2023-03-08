import * as lit from 'lit-html';
import { RenderResult, render } from '@lit-labs/ssr';
import { SafeHtml, unsafeTreatStringAsSafeHtml } from 'rules_prerender';

/** Re-export from `lit-html` for convenience. */
export const html = lit.html;

/** Re-export from `lit-html` for convenience. */
export type TemplateResult = lit.TemplateResult;

/** Renders the given Lit template to {@link SafeHtml}. */
export async function renderToHtml(template: TemplateResult):
        Promise<SafeHtml> {
    const rendered = await collectResult(render(template));
    return unsafeTreatStringAsSafeHtml(rendered);
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
