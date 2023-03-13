export class MyComponent extends HTMLElement {
    public override shadowRoot!: ShadowRoot;

    public connectedCallback(): void {
        const replace = this.shadowRoot.getElementById('replace');
        if (!replace) throw new Error('No `#replace` element.');
        replace.textContent = 'Hello from JavaScript!';
    }
}

customElements.define('my-component', MyComponent);

declare global {
    interface HTMLElementTagNameMap {
        'my-component': MyComponent;
    }
}
