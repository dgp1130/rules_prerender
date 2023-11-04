/**
 * @fileoverview Utilities for mocking routing.
 * @see /README.md#Mocking
 *
 * There is no `mockRouteForest` because a {@link RouteForest} is just an array
 * of {@link Route}. So `mockRouteForest` can be implemented as an array of
 * {@link mockRoute} calls.
 */

import { type Route, type RouteConfig } from './routing.mjs';

/**
 * Track each generated route so that the default label and path have unique
 * values. This runs the risk of making tests non-deterministic as route content
 * is dependent on the ordering of {@link mockRouteConfig} calls which could
 * depend on async work timing. In well behaved tests, this should be an issue.
 * Most async work is mocked, generally shouldn't block mock route creation, and
 * tests shouldn't depend on the specifics of this data anyways. As a result,
 * breaking non-deterministic reliance on these values is arguably a feature.
 */
let routeCount = 0;

/** Mocks a {@link RouteConfig} object with the given overrides. */
export function mockRouteConfig(overrides: Partial<RouteConfig> = {}):
        RouteConfig {
    const config = {
        label: `Really cool page #${routeCount}`,
        path: `/path/to/page/indexed/${routeCount}/`,
        ...overrides,
    };
    routeCount++;
    return config;
}

/** Mocks a {@link Route} object with the given overrides. */
export function mockRoute(overrides: Partial<Route> = {}): Route {
    const route = {
        label: `Really cool page #${routeCount}`,
        path: `/path/to/page/indexed/${routeCount}`,
        children: [],
        ...overrides,
    };
    routeCount++;

    for (const child of route.children) {
        (child as { parent?: Route }).parent = route;
    }

    return route;
}
