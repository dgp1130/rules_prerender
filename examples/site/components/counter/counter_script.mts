/**
 * @fileoverview A counter custom element which is prerendered at build time
 * with an initial value and then updated by the user client-side. This
 * component could be implemented in any custom element. This particular
 * approach uses [HydroActive](https://github.com/dgp1130/HydroActive/) to
 * implement the component in the most performant fashion without duplicating
 * rendering logic across the client and the server.
 */

import { defineComponent } from 'hydroactive';
import { live } from 'hydroactive/signal-accessors.js';

/**
 * Custom element for `<site-counter />`. Implements the functionality for a
 * counter with a prerendered initial value.
 */
export const Counter = defineComponent('site-counter', (comp, host) => {
    const count = live(host.shadow.query('#count').access(), comp, Number);

    // Listen for decrement button clicks.
    const dec = host.shadow.query('button#decrement').access();
    dec.listen(comp, 'click', () => { count.set(count() - 1); });
    dec.element.disabled = false;

    // Listen for increment button clicks.
    const inc = host.shadow.query('button#increment').access();
    inc.listen(comp, 'click', () => { count.set(count() + 1); });
    inc.element.disabled = false;
});
