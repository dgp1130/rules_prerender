import { component } from 'hydroactive';

/**
 * Represents the UI header with the page title and a hamburger menu.
 *
 * @event toggle-menu Triggered on hamburger menu click.
 */
export const Header = component('rp-header', ($) => {
    $.listen($.query('#hamburger'), 'click', () => {
        $.host.dispatchEvent(new CustomEvent('toggle-menu'));
    });
});

declare global {
    interface HTMLElementTagNameMap {
        'rp-header': InstanceType<typeof Header>;
    }
}
