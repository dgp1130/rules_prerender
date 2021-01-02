import { includeStyle } from 'rules_prerender';
import { renderComponent } from 'rules_prerender/examples/styles/component/component';

/** Render an HTML page. */
export default function(): string {
    return `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Styling</title>
                <link rel="stylesheet" href="/page_styles.css">
            </head>
            <body>
                <h2>Styling</h2>
                <div class="page">
                    <div class="label">I'm a page with some CSS!</div>
                    ${renderComponent()}
                    ${includeStyle('rules_prerender/examples/styles/page.css')}
                </div>
            </body>
        </html>
    `;
}
