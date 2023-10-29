import { component } from 'hydroactive';
import { Header } from '../header/header_script.mjs';
import { NavPane } from '../nav_pane/nav_pane_script.mjs';

/**
 * Represents the full page layout. Acts as the top-level component for the
 * page.
 */
export const Layout = component('rp-layout', ($) => {
    // Bind header menu clicks to show/hide the nav pane.
    $.hydrate('rp-nav-pane', NavPane);
    const header = $.hydrate('rp-header', Header);
    $.listen(header, 'toggle-menu', () => {
        $.host.classList.toggle('nav-collapsed');
    });
});

declare global {
    interface HTMLElementTagNameMap {
        'rp-layout': InstanceType<typeof Layout>;
    }
}
