import { runfiles } from '@bazel/runfiles';
import express from 'express';
import * as yargs from 'yargs';
import { ssr } from 'rules_prerender/packages/express/express';

const { port } = yargs.option('port', {
    type: 'number',
    default: 8000,
    description: `Port to bind to.`,
}).argv;

const app = express();
app.get('/**.html', ssr(runfiles.resolvePackageRelative('testdata')));

app.listen(port, () => {
    console.log(`Serving on port ${port}...`);
});
