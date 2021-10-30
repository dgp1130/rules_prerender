/**
 * Custom element for `<site-counter />`. Implements the functionality for a
 * prerendered counter. Must be rendered with three child elements:
 * 1. `[label]` - The current state of the counter is rendered here.
 * 2. `button[decrement]` - Decrements the counter when clicked.
 * 3. `button[increment]` - Increments the counter when clicked.
 * 
 * Can provide an `initial` attribute with an integer which will act as the
 * initial value. Defaults to `0` if not given.
 */
export class Counter extends HTMLElement {
    public override shadowRoot!: ShadowRoot; // Assume shadow root is defined.
    private value!: number;
    private removeListeners!: () => void;

    // Hydrate the component on startup.
    public connectedCallback(): void {
        // Get the initial value.
        const initial = this.getAttribute('initial');
        this.value = initial ? parseInt(initial) : 0;

        // Find the increment and decrement buttons in the prerendered DOM.
        const decrementBtn = this.shadowRoot.querySelector('button[decrement]');
        if (!decrementBtn) throw new Error('No `button[decrement]` element!');
        const incrementBtn = this.shadowRoot.querySelector('button[increment]');
        if (!incrementBtn) throw new Error('No `button[increment]` element!');

        // Attach event listeners.
        const onDecrement = this.onDecrement.bind(this);
        decrementBtn.addEventListener('click', onDecrement);
        const onIncrement = this.onIncrement.bind(this);
        incrementBtn.addEventListener('click', onIncrement);
        this.removeListeners = () => {
            decrementBtn.removeEventListener('click', onDecrement);
            incrementBtn.removeEventListener('click', onIncrement);
        };

        // Enable the button
        decrementBtn.removeAttribute('disabled');
        incrementBtn.removeAttribute('disabled');
    }

    public disconnectedCallback(): void {
        this.removeListeners();
    }

    private render(): void {
        const text = this.shadowRoot.querySelector('[label]');
        if (!text) throw new Error('No `[label]` element to render to!');
        text.textContent = `The current count is: ${this.value}.`;
    }

    private onDecrement(): void {
        this.value--;
        this.render();
    }

    private onIncrement(): void {
        this.value++;
        this.render();
    }
}

customElements.define('site-counter', Counter);
