import { component } from 'hydroactive';

/** TODO */
export const MyPureComponent = component('my-pure-component', (host) => {
    host.write('Hydrated!', String);
});

declare global {
    interface HTMLElementTagNameMap {
        'my-pure-component': InstanceType<typeof MyPureComponent>;
    }
}
