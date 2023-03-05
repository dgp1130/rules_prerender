// Overwrite a prerendered HTML element with different content.
const el = document.getElementById('component-replace');
if (!el) throw new Error('Could not find `#component-replace` element.');
el.innerText = 'This text rendered by component JavaScript!';
