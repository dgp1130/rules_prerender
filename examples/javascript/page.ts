import { renderComponent } from './component/component';

/** Render some HTML with a `<script />` tag. */
export default function(): string {
    return `
        <!DOCTYPE html>
        <html>
            <head>
                <title>JavaScript</title>
                <!-- Load client-side JavaScript. -->
                <script src="/bundle.js" async defer></script>
            </head>
            <body>
                <h2>JavaScript</h2>
                <div id="replace">
                    To be replaced by client-side JavaScript.
                </div>
                ${renderComponent()}
            </body>
        </html>
    `;
}
