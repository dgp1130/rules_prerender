import { renderComponent } from 'rules_prerender/examples/resources/component/component';

export default function(): string {
    return `
<!DOCTYPE html>
<html>
    <head>
        <title>Resources</title>
    </head>
    <body>
        <h2>Resources</h2>

        <div>Hello from the page!</div>
        ${renderComponent()}
    </body>
</html>
    `;
}
