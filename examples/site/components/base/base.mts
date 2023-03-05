import { inlineStyle } from 'rules_prerender';
import { renderHeader } from '../header/header.mjs';
import { renderFooter } from '../footer/footer.mjs';

/**
 * Provides a basic structure for an HTML page.
 * 
 * @param title The title of the HTML document.
 * @param main A function that returns the content of the main body of the
 *     document. Will be wrapped in a `<main />` tag, so need to add one in the
 *     callback.
 */
export async function baseLayout(
    title: string,
    main: () => string | Promise<string>,
): Promise<string> {
    return `
<!DOCTYPE html>
<html comp-base>
    <head>
        <title>${title}</title>
        <meta charset="utf-8">
        ${inlineStyle('./base.css', import.meta)}
    </head>
    <body>
        ${renderHeader()}
        <div class="main-container">
            <main>${await main()}</main>
        </div>
        ${renderFooter()}
    </body>
</html>
    `;
}
