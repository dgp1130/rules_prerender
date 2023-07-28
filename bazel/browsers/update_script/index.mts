/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import yargs from 'yargs';
import {findLatestRevisionForAllPlatforms} from './find-revision-chromium.mjs';

async function main() {
  await yargs(process.argv.slice(2))
    .strict()
    .help()
    .scriptName('<cmd>')
    .demandCommand()
    .command(
      'find-latest-chromium-revision [start-revision]',
      'Finds the latest stable revision for Chromium with artifacts available for all platforms.',
      (args) => args.positional('startRevision', {type: 'number'}),
      (args) => findLatestRevisionForAllPlatforms(args.startRevision),
    )
    .parseAsync();
}

main().catch((e) => {
  console.log(e);
  process.exitCode = 1;
});
