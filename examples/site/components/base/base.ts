/**
 * Provides a basic structure for an HTML page.
 * 
 * @param title The title of the HTML document.
 * @param main A function that returns the content of the main body of the
 *     document. Will be wrapped in a `<main />` tag, so need to add one in the
 *     callback.
 */
export function baseLayout(title: string, main: () => string): string {
    return `
        <!DOCTYPE html>
        <html>
            <head>
                <title>${title}</title>
                <meta charset="utf-8">
            </head>
            <body>
                <main>
                    ${main()}
                </main>
            </body>
        </html>
    `;
}
