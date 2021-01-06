import { includeStyle } from 'rules_prerender';
import { baseLayout } from 'rules_prerender/examples/site/components/base/base';

/** Renders the entire home page. */
export default function (): string {
    return baseLayout('Home', () => `
        <div comp-home>
            <article>
                <span>This is the home page!</span>
            </article>
            ${includeStyle('rules_prerender/examples/site/home/home.css')}
        </div>
    `);
}
