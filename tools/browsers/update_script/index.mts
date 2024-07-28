/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be found
 * in the LICENSE file at https://angular.io/license
 */

import yargs from 'yargs';
import { main } from '../../../common/binary.mjs';
import { findLatestRevisionForAllPlatforms } from './find_revision_chromium.mjs';

void main(async (args) => {
    const { startRevision } = yargs(args)
        .strict()
        .scriptName('update_script')
        .usage('Finds the latest stable revision for Chromium with artifacts'
            + ' available for all platforms.')
        .option('start-revision', { type: 'number' })
        .parseSync();

    return findLatestRevisionForAllPlatforms(startRevision);
});
