import styles from 'rules_prerender/examples/site/components/header/header.css';

/** Renders a header component with navigation to the rest of the site. */
export function renderHeader(): string {
    return `
        <header class="${styles.header}">
            <h1 class="${styles.title}">My super cool site!</h1>
            <nav class="${styles.navigation}">
                <ul class="${styles.list}">
                    <li><a href="/">Home</a></li>
                    <li><a href="/counter/">Counter</a></li>
                    <li><a href="/blog/">Blog</a></li>
                    <li><a href="/about/">About</a></li>
                </ul>
            </nav>
        </header>
    `;
}
