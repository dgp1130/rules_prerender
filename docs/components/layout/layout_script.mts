import { component } from 'hydroactive';
import { createSignal } from 'hydroactive/signal.js';
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
    const navDialog = $.read('dialog', HTMLDialogElement);

    // Initialize the navigation pane. We let CSS decide whether the nav pane is
    // shown by default and then apply that state to the DOM so CSS doesn't live
    // update when the user changes the viewport width.
    const navWidth =
        getComputedStyle($.host).getPropertyValue('--rp-layout--nav-width');
    const [ expanded, setExpanded ] = createSignal(navWidth !== '0px');

    // Bind header menu clicks to toggle the nav pane.
    $.listen(header, 'toggle-menu', () => { setExpanded(!expanded()); });
    $.effect(() => {
        $.host.setAttribute('nav', getNavState(expanded()));
        if (expanded()) {
            navDialog.showModal();
        } else {
            navDialog.close();
        }
    });

    $.listen(navDialog, 'close', () => { setExpanded(false); });

    $.listen(navDialog, 'click', (evt) => {
        if (evt.target === navDialog) navDialog.close();
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
