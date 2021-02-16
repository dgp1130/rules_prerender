import { includeStyle } from 'rules_prerender';

/** Renders a header component with navigation to the rest of the site. */
export function renderHeader(): string {
    return `
        <header comp-header>
            <h1>My super cool site!</h1>
            <nav>
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/counter/">Counter</a></li>
                    <li><a href="/blog/">Blog</a></li>
                    <li><a href="/about/">About</a></li>
                </ul>
            </nav>

            ${includeStyle('rules_prerender/examples/site/components/header/header.css')}
        </header>
    `;
}
