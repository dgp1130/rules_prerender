import { target } from './ts_child_script';

const replace = document.getElementById('replace-js-parent-script');
if (replace) replace.innerText = `Hello, ${target}!`;
