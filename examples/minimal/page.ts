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
        <h2>Hello, World!</h2>
        <span>${foo}</span>
        <span>${bar}</span>
    </body>
</html>
    `.trim() + '\n' /* trailing newline */;
}
