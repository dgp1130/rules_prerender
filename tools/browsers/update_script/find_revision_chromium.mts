/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be found
 * in the LICENSE file at https://angular.io/license
 */

/**
 * @fileoverview
 * Script that fetches the latest revision currently in the "stable" channel of
 * Chromium. It then checks if build artifacts on the CDN exist for that
 * revision. If there are missing build artifacts, it looks for more recent
 * revisions, starting from the determined revision in the stable channel, and
 * checks if those have build artifacts. This allows us to determine a Chromium
 * revision that is as close as possible to the "stable" channel and we have CDN
 * artifacts available for each supported platform.
 *
 * This is needed because Chromium does not build artifacts for every revision.
 * See: https://github.com/puppeteer/puppeteer/issues/2567#issuecomment-393436282
 *
 * Note: An explicit revision can be specified as command line argument. This
 * allows for finding snapshot builds if a revision is already known. e.g.
 * consider a case where a specific Chromium bug (needed for the Angular org) is
 * fixed but is ahead of the current revision in the stable channel. We still
 * may want to update Chromium to a revision ahead of the specified revision for
 * which snapshot builds exist.
 */

import { createHash } from 'crypto';
import { ArtifactType } from './browser_artifact.mjs';
import { Chromium } from './chromium.mjs';
import { Platform } from './platform.mjs';

/**
 * Entry-point for the script, finding a revision which has snapshot builds for
 * all platforms. If an explicit start revision has been specified, this
 * function looks for a closest revision that is available for all platforms. If
 * none has been specified, we look for a revision that is as close as possible
 * to the revision in the stable release channel.
 *
 * Returns an exit code based on whether or not it was successful.
 */
export async function findLatestRevisionForAllPlatforms(
    explicitStartRevision?: number,
): Promise<number> {
    const availableRevision =
        explicitStartRevision === undefined
            ? await findClosestStableRevisionForAllPlatforms()
            : await findClosestAscendingRevisionForAllPlatforms(
                explicitStartRevision);

    if (availableRevision === undefined) {
        console.error('Could not find a revision for which builds are available'
            + ' for all platforms.');
        return 1;
    }

    const browser = new Chromium(availableRevision);

    console.info('Found a revision for which builds are available for all'
        + ' platforms.');
    console.info('Printing the URLs and archive checksums:');
    console.info();
    // Note: We cannot extract the Chromium version and commit automatically
    // because this requires an actual browser resolving a manual `window.open`
    // redirect.
    console.info(
        'Release Info:', await getReleaseInfoUrlForRevision(availableRevision));
    console.info(
        'Click on the link above to determine the Chromium version number.');
    console.info();

    for (const platformName of Object.keys(Platform)) {
        const platform = Platform[platformName as keyof typeof Platform];

        console.info(
            `${platformName}: `.padEnd(10),
            browser.getDownloadUrl(platform, ArtifactType.BrowserBin),
        );
        console.info(
            ' '.repeat(15),
            await getSha256ChecksumForPlatform(
                browser, platform, ArtifactType.BrowserBin),
        );
        console.info(
            ' '.repeat(10),
            browser.getDownloadUrl(platform, ArtifactType.DriverBin));
        console.info(
            ' '.repeat(15),
            await getSha256ChecksumForPlatform(
                browser, platform, ArtifactType.DriverBin),
        );
        console.info();
    }

    return 0;
}

/**
 * Finds a Chromium revision which is as close as possible to the revision
 * currently in the stable release channel, and for which snapshot builds exist
 * for all platforms.
 */
async function findClosestStableRevisionForAllPlatforms():
        Promise<number | undefined> {
    const stableBaseRevision = await getStableChromiumRevision();

    // Note: We look for revisions with snapshot builds for every platform by
    // searching in ascending order because going back to older revisions would
    // mean that we use a revision which might miss fixes that have landed
    // before the determined "stable" revision has been released. Note that
    // searching for a revision is ascending order is technically also not ideal
    // because it may contain new regressions, or new APIs, but either way is
    // not ideal here. It seems better to use a more up-to-date revision, rather
    // than relying on code that has already been fixed, but we'd accidentally
    // use it then.
    return findClosestAscendingRevisionForAllPlatforms(stableBaseRevision);
}

/**
 * Finds a Chromium revision in ascending order which is as close as possible to
 * the specified revision and has snapshot builds for all platforms.
 */
async function findClosestAscendingRevisionForAllPlatforms(
    startRevision: number,
): Promise<number | undefined> {
    return lookForRevisionWithBuildsForAllPlatforms(
        startRevision, await getHeadChromiumRevision());
}

/**
 * Looks for revision within the specified revision range for which builds exist
 * for every platform. This is needed because there are no builds available for
 * every revision that lands within Chromium. More details can be found here:
 * https://github.com/puppeteer/puppeteer/issues/2567#issuecomment-393436282.
 */
async function lookForRevisionWithBuildsForAllPlatforms(
    startRevision: number,
    toRevision: number,
): Promise<number | undefined> {
    console.log('Looking for revision build.');
    const increment = toRevision >= startRevision ? 1 : -1;

    for (let i = startRevision; i !== toRevision; i += increment) {
        const checks = await Promise.all(
            Object.values(Platform)
                .map((p) => isRevisionAvailableForPlatform(i, p)),
        );

        // If the current revision is available for all platforms, stop
        // searching and return the current revision.
        if (checks.every((isAvailable) => isAvailable)) {
            console.log(` √ Found revision: r${i}`);
            return i;
        }
    }
    console.log(' ✘ No revision found.');
    return undefined;
}

/** Checks if the specified revision is available for the given platform. */
async function isRevisionAvailableForPlatform(
    revision: number,
    platform: Platform,
): Promise<boolean> {
    // Look for the `driver` archive as this is smaller and faster to check.
    const response = await fetch(Chromium.getDownloadArtifactUrl(
        revision, platform, ArtifactType.DriverBin));
    return response.ok && response.status === 200;
}

/**
 * Gets the latest revision currently in the `stable` release channel of
 * Chromium.
 */
async function getStableChromiumRevision(): Promise<number> {
    // Endpoint is maintained by the Chromium team and can be consulted for
    // determining the current latest revision in stable channel.
    // https://github.com/googlechromelabs/chrome-for-testing/
    const response = await fetch(
        `https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions.json`,
    );
    const revisionStr = (await response.json()).channels.Stable.revision;
    return Number(revisionStr);
}

/** Gets the Chromium release information page URL for a given revision. */
async function getReleaseInfoUrlForRevision(revision: number):
        Promise<string | null> {
    // This is a site used and maintained by the Chromium team.
    // https://chromium.googlesource.com/chromium/chromium/+/refs/heads/trunk/tools/omahaproxy.py.
    return `https://storage.googleapis.com/chromium-find-releases-static/index.html#r${revision}`;
}

/** Determines the latest Chromium revision available in the CDN. */
async function getHeadChromiumRevision(): Promise<number> {
    const responses = await Promise.all(
        Object.values(Platform)
            .map((p) => fetch(Chromium.getLatestRevisionUrl(p))),
    );
    const revisions =
        await Promise.all(responses.map(async (r) => Number(await r.text())));
    return Math.max(...revisions);
}

/**
 * Gets the SHA256 checksum for the platform archive of a given chromium
 * instance.
 */
async function getSha256ChecksumForPlatform(
    browser: Chromium,
    platform: Platform,
    artifactType: ArtifactType,
): Promise<string> {
    const response =
        await fetch(browser.getDownloadUrl(platform, artifactType));
    const binaryContent = Buffer.from(await response.arrayBuffer());
    return createHash('sha256').update(binaryContent).digest('hex');
}
