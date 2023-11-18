import { component } from 'hydroactive';
import { Header } from '../header/header_script.mjs';
import { NavPane } from '../nav_pane/nav_pane_script.mjs';

enum NavState {
    Collapsed = 'collapsed',
    Expanded = 'expanded',
}

/**
 * Represents the full page layout. Acts as the top-level component for the
 * page.
 */
export const Layout = component('rp-layout', ($) => {
    $.hydrate('rp-nav-pane', NavPane);
    const header = $.hydrate('rp-header', Header);

    // Initialize the navigation pane. We let CSS decide whether the nav pane is
    // shown by default and then apply that state to the DOM so CSS doesn't live
    // update when the user changes the viewport width.
    const navWidth =
        getComputedStyle($.host).getPropertyValue('--rp-layout--nav-width');
    let expanded = navWidth !== '0px';
    $.host.setAttribute('nav', getNavState(expanded));

    // Bind header menu clicks to toggle the nav pane.
    $.listen(header, 'toggle-menu', () => {
        expanded = !expanded;
        $.host.setAttribute('nav', getNavState(expanded));
    });
});

declare global {
    interface HTMLElementTagNameMap {
        'rp-layout': InstanceType<typeof Layout>;
    }
}

function getNavState(expanded: boolean): NavState {
    return expanded ? NavState.Expanded : NavState.Collapsed;
}
