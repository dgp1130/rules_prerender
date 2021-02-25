import { foo } from './transitive_script';

console.log(foo()); // DEBUG

if (document.readyState === 'complete'
        || document.readyState === 'interactive') {
    // Document already loaded.
    update();
} else {
    // Wait for document to load.
    document.addEventListener('DOMContentLoaded', () => {
        update();
    });
}

function update() {
    // Overwrite a prerendered HTML element with different content.
    const el = document.getElementById('component-replace');
    if (!el) throw new Error('Could not find `#component-replace` element.');
    el.innerText = 'This text rendered by component JavaScript!';
}
