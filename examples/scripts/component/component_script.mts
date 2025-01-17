import { component } from 'hydroactive';

/** Still pure because `<MyHostComponent definition=...>` calls `.define` automatically! */
export const MyHostComponent = component('my-host-component', (host) => {
    // Lazy load the child component.
    void import('./pure_component.mjs').then(({ MyPureComponent }) => {
        // HydroActive enforces that the component definition is required.
        host.query('my-pure-component').hydrate(MyPureComponent);
    });
});

// Overwrite a prerendered HTML element with different content.
const el = document.getElementById('component-replace');
if (!el) throw new Error('Could not find `#component-replace` element.');
el.innerText = 'This text rendered by component JavaScript!';
