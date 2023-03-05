export {}; // Treat this as an ES module.

// Overwrite a prerendered HTML element with different content.
const el = document.getElementById('replace-bar');
if (!el) throw new Error('Could not find `#replace-bar` element.');
el.innerText = 'This text rendered by page JavaScript!';
