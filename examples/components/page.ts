import { render as renderComponent } from './component';

/** Renders a page using components. */
export default function(): string {
    return `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Components</title>
            </head>
            <body>
                <h2>Components</h2>
                ${renderComponent()}
            </body>
        </html>
    `;
}
