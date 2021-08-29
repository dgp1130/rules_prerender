import { target } from './js_child_script';

const replace = document.getElementById('replace-ts-parent-script');
if (replace) replace.innerText = `Hello, ${target}!`;
