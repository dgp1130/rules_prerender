import { bar, foo } from './dep';

/** Renders the page. */
export default function(): string {
    return `
<!DOCTYPE html>
<html>
    <head>
        <title>Minimal</title>
    </head>
    <body>
        <h2 id="hello">Hello, World!</h2>
        <span id="foo">${foo}</span>
        <span id="bar">${bar}</span>
    </body>
</html>
    `.trim() + '\n' /* trailing newline */;
}
