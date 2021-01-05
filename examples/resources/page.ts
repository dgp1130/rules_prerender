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

        <div>
            <span>Hello from the page!</span>
            <img src="/favicon.ico" />
        </div>
        ${renderComponent()}
    </body>
</html>
    `;
}
