export {}; // Treat this as an ES module.

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

function update(): void {
    // Overwrite a prerendered HTML element with different content.
    const el = document.getElementById('replace-bar');
    if (!el) throw new Error('Could not find `#replace-bar` element.');
    el.innerText = 'This text rendered by page JavaScript!';
}
