/**
 * @fileoverview Polyfills declarative shadow DOM by searching for templates
 *     which match its attributes and attaching them as real shadow roots.
 *
 * Shamelessly stolen from: https://web.dev/declarative-shadow-dom/#polyfill and
 * adapted for TypeScript.
 */

function applyDsdNodes(root: Element | ShadowRoot): void {
    const templates = root.querySelectorAll('template[shadowrootmode]') as
            NodeListOf<HTMLTemplateElement>;
    for (const template of Array.from(templates)) {
        const mode = template.getAttribute('shadowrootmode');
        if (mode !== 'open' && mode !== 'closed') {
            console.error(
                `Found declarative shadow root with invalid mode: ${mode}.`);
            continue;
        }

        const parent = template.parentNode as Element;
        const shadowRoot = parent.attachShadow({ mode });
        shadowRoot.appendChild(template.content);
        template.remove();
        applyDsdNodes(shadowRoot);
    }
}

applyDsdNodes(document.documentElement);
