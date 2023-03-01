import { target } from './js_child_script.mjs';

const replace = document.getElementById('replace-ts-parent-script');
if (replace) replace.innerText = `Hello, ${target}!`;
