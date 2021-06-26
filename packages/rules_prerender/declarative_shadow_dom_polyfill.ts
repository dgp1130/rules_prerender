/**
 * Shamelessly stolen from: https://web.dev/declarative-shadow-dom/#polyfill and
 * adapted for TypeScript.
 */

// TESTME
const templates = document.querySelectorAll('template[shadowroot]') as
        NodeListOf<HTMLTemplateElement>;
for (const template of Array.from(templates)) {
    const mode = template.getAttribute('shadowroot')!;
    if (mode !== 'open' && mode !== 'closed') {
        console.error(`Found declarative shadow root with invalid mode: ${mode}.`);
        continue;
    }
    const parent = template.parentNode as Element;
    const shadowRoot = parent.attachShadow({ mode });
    shadowRoot.appendChild(template.content);
    template.remove();
}
