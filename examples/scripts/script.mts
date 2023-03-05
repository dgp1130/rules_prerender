// Overwrite a prerendered HTML element with different content.
const el = document.getElementById('replace');
if (!el) throw new Error('Could not find `#replace` element.');
el.innerText = 'This text rendered by page JavaScript!';
