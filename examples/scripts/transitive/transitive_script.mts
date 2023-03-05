export {}; // Treat this as an ES module.

// Overwrite a prerendered HTML element with different content.
const el = document.getElementById('transitive-replace');
if (!el) throw new Error('Could not find `#transitive-replace` element.');
el.innerText = 'This text rendered by transitive JavaScript!';
