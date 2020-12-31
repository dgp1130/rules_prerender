import { includeScript } from 'rules_prerender';
import { renderComponent } from 'rules_prerender/examples/custom_bundling/component/component';

/** Render some HTML with a `<script />` tag. */
export default function(): string {
    return `
        <!DOCTYPE html>
        <html>
            <head>
                <title>JavaScript</title>
            </head>
            <body>
                <h2>JavaScript</h2>
                <div id="replace">
                    This text to be overwritten by client-side JavaScript.
                </div>
                ${includeScript('rules_prerender/examples/custom_bundling/script')}
                ${renderComponent()}
            </body>
        </html>
    `;
}
