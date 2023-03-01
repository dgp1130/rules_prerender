export class MyComponent extends HTMLElement {
    connectedCallback(): void {
        const el = this.shadowRoot.querySelector('#replace');
        if (!el) throw new Error('Could not find `#replace` element.');
        el.textContent = 'This text rendered by page JavaScript!';
    }
}

customElements.define('my-component', MyComponent);
