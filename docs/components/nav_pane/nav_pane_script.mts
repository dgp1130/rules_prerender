import { defineComponent } from 'hydroactive';

/** Controls the navigation pane by expanding and collapsing list items. */
export const NavPane = defineComponent('rp-nav-pane', (comp, host) => {
    host.listen(comp, 'click', (evt: Event) => {
        // Ignore clicks not coming from toggle buttons.
        const target = (evt.composedPath()[0] as HTMLElement);
        if (!target.hasAttribute('data-list-toggle')) {
            return;
        }

        // Find the `<li>` tag containing the clicked button.
        const parentListItem = target.closest('li');
        if (!parentListItem) {
            throw new Error('Could not find list item for button');
        }

        // Toggle the sublist's visibility.
        parentListItem.classList.toggle('expanded');
    });
});

declare global {
    interface HTMLElementTagNameMap {
        'rp-nav-page': InstanceType<typeof NavPane>;
    }
}
