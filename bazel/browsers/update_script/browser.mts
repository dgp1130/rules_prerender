/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be found
 * in the LICENSE file at https://angular.io/license
 */

import { BrowserArtifact, ArtifactType } from './browser-artifact.mjs';
import { Platform } from './platform.mjs';

/** Interface describing a browser. */
export interface Browser<T> {
  name: string;
  revision: T;
  supports(platform: Platform): boolean;
  getArtifact(platform: Platform, type: ArtifactType): BrowserArtifact;
}
