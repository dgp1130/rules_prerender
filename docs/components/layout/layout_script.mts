import { defineComponent } from 'hydroactive';
import { Header } from '../header/header_script.mjs';
import { NavPane } from '../nav_pane/nav_pane_script.mjs';

/**
 * Represents the full page layout. Acts as the top-level component for the
 * page.
 */
export const Layout = defineComponent('rp-layout', (comp, host) => {
    // Bind header menu clicks to show/hide the nav pane.
    host.shadow.query('rp-nav-pane').hydrate(NavPane);
    const header = host.shadow.query('rp-header').hydrate(Header);
    header.listen(comp, 'toggle-menu', () => {
        host.element.classList.toggle('nav-collapsed');
    });
});

declare global {
    interface HTMLElementTagNameMap {
        'rp-layout': InstanceType<typeof Layout>;
    }
}
