/**
 * @fileoverview A counter custom element which is prerendered at build time
 * with an initial value and then updated by the user client-side. This
 * component could be implemented in any custom element. This particular
 * approach uses [HydroActive](https://github.com/dgp1130/HydroActive/) to
 * implement the component in the most performant fashion without duplicating
 * rendering logic across the client and the server.
 */

import { component } from 'hydroactive';

/**
 * Custom element for `<site-counter />`. Implements the functionality for a
 * counter with a prerendered initial value.
 */
export const Counter = component('site-counter', ($) => {
    // Two-way binding of the count in the DOM.
    const [ count, setCount ] = $.live('#count', Number);

    // Listen for decrement button clicks.
    const dec = $.query('button#decrement');
    $.listen(dec, 'click', () => { setCount(count() - 1); });
    dec.disabled = false;

    // Listen for increment button clicks.
    const inc = $.query('button#increment');
    $.listen(inc, 'click', () => { setCount(count() + 1); });
    inc.disabled = false;

    // Bind the current count to the DOM.
    $.bind('#count', count);
});
