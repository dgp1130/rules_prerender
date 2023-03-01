/**
 * @fileoverview This file should be tree-shaken because the function which
 * prerenders this is never called at build time.
 */

// If this is loaded, that's an error, so delete the whole document to fail any
// test which asserts on it.
document.body.innerText = 'Error: Unused script was not tree-shaken.';
