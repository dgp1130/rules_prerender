const { renderTsChild } = require('../ts_child/ts_child');

function renderJsParent() {
    return `
<div class="js-parent">
    <span>JS parent</span>
    ${renderTsChild()}
</div>
    `.trim();
}

module.exports = { renderJsParent };
