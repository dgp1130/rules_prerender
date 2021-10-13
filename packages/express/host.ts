import express from 'express';
import * as yargs from 'yargs';
import { ssr } from 'rules_prerender/packages/express/express';

export function main(webRoot: string): void {
    const { port } = yargs.option('port', {
        type: 'number',
        default: '8000',
        description: `Port to bind to.`,
    }).argv;
    
    const app = express();
    
    app.get(['/**.html', '/', '/**/$'], ssr(webRoot));
    app.get(['/**.js', '/**.css'], express.static(webRoot));
    
    app.listen(port, () => {
        console.log(`Listening on port ${port}...`);
    });
}
