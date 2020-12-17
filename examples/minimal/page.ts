import { bar, foo } from './dep';

/** Renders the page. */
export default function(): string {
    return `
<!DOCTYPE html>
<html>
    <head>
        <title>Minimal</title>
        <!-- For live-reload script from \`ts_devserver()\`. -->
        <script src="/_/ts_scripts.js" async defer></script>
    </head>
    <body>
        <h2>Hello, World!</h2>
        <span>${foo}</span>
        <span>${bar}</span>
    </body>
</html>
    `.trim() + '\n' /* trailing newline */;
}
