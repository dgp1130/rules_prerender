import { inlineStyle } from '@rules_prerender/preact';
import { VNode } from 'preact';
import { Header } from '../header/header.js';
import { Footer } from '../footer/footer.js';

/**
 * Provides a basic structure for an HTML page.
 * 
 * @param title The title of the HTML document.
 * @param main A function that returns the content of the main body of the
 *     document. Will be wrapped in a `<main />` tag, so need to add one in the
 *     callback.
 */
export function baseLayout(
    title: string,
    main: VNode,
): VNode {
    return <html comp-base>
        <head>
            <title>{title}</title>
            <meta charSet='utf-8' />
            {inlineStyle('./base.css', import.meta)}
        </head>
        <body>
            <Header />
            <div class="main-container">
                <main>{main}</main>
            </div>
            <Footer />
        </body>
    </html>;
}
