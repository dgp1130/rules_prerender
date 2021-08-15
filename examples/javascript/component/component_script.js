/** @fileoverview Replaces a DOM element at load time. */

import { hello } from './component_script_dep';

const el = document.getElementById('component-replace');
el.innerText = `This text rendered by component JavaScript: "${hello}"`;
