import { PrerenderResource } from 'rules_prerender';
import { renderComponent } from 'rules_prerender/examples/styles/component/component';
import styles from './page.css';

/** Render an HTML page. */
export default function*(): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.of('/index.html', `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Styling</title>
            </head>
            <body>
                <h2>Styling</h2>
                <div class="${styles.page}">
                    <div class="${styles.label}" page-label>
                        I'm a page with some CSS!
                    </div>
                    ${renderComponent()}
                </div>
            </body>
        </html>
    `);
}
