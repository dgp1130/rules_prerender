import { component } from 'hydroactive';

/** Controls the navigation pane by expanding and collapsing list items. */
export const NavPane = component('rp-nav-pane', ($) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    $.listen($.host.shadowRoot!, 'click', toggleNavItem);
});

declare global {
    interface HTMLElementTagNameMap {
        'rp-nav-page': InstanceType<typeof NavPane>;
    }
}

/** Toggles the expanded state of the clicked navigation list item. */
function toggleNavItem(evt: Event): void {
    // Ignore clicks not coming from toggle buttons.
    const target = (evt.target as HTMLElement);
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

    // Updated the `collapsed` class to be `!expanded`. This _feels_ unnecessary
    // but actually isn't. On page load, no items have any classes. After
    // expanding and collapsing an item, it has the `collapsed` class. This
    // distinguishes "an element which has been closed" from "an element which
    // has not been interacted with". This distinction is important for
    // animations, which should only play in the former case.
    if (parentListItem.classList.contains('expanded')) {
        parentListItem.classList.remove('collapsed');
    } else {
        parentListItem.classList.add('collapsed');
    }
}
