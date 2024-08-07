import { defineComponent } from 'hydroactive';

/**
 * Represents the UI header with the page title and a hamburger menu.
 *
 * @event toggle-menu Triggered on hamburger menu click.
 */
export const Header = defineComponent('rp-header', (comp, host) => {
    host.shadow.query('#hamburger').access().listen(comp, 'click', () => {
        host.element.dispatchEvent(new CustomEvent('toggle-menu'));
    });
});

declare global {
    interface HTMLElementTagNameMap {
        'rp-header': InstanceType<typeof Header>;
    }
}
