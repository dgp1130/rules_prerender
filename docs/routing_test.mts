import { PrerenderResource, safe, SafeHtml } from 'rules_prerender';
import { arrayFromAsync } from './common/iterables.mjs';
import { type RouteConfig, bootstrap, generateRoutePages } from './routing.mjs';
import { mockRouteConfig } from './routing_mock.mjs';

type Render = NonNullable<RouteConfig['render']>;

describe('routing', () => {
    describe('generateRoutePages', () => {
        it('renders all routes in the given configuration', async () => {
            const routes = [
                mockRouteConfig({
                    path: 'first/',
                    render: () => safe`<div>First</div>`,
                }),
                mockRouteConfig({
                    path: 'second/',
                    render: () => safe`<div>Second</div>`,
                }),
                mockRouteConfig({
                    path: 'third/',
                    render: () => safe`<div>Third</div>`,
                }),
            ];

            const resources = await arrayFromAsync(generateRoutePages(routes));
            expect(resources).toContain(PrerenderResource.fromHtml(
                '/first/index.html',
                safe`<div>First</div>`,
            ));
            expect(resources).toContain(PrerenderResource.fromHtml(
                '/second/index.html',
                safe`<div>Second</div>`,
            ));
            expect(resources).toContain(PrerenderResource.fromHtml(
                '/third/index.html',
                safe`<div>Third</div>`,
            ));
        });

        it('renders an HTML file extension', async () => {
            const routes = [
                mockRouteConfig({
                    path: 'hello.html',
                    render: () => safe`<div>Hello</div>`,
                }),
            ];

            const resources = await arrayFromAsync(generateRoutePages(routes));

            expect(resources).toEqual([
                PrerenderResource.fromHtml(
                    '/hello.html',
                    safe`<div>Hello</div>`,
                ),
            ]);
        });

        it('renders child routes', async () => {
            const routes = [
                mockRouteConfig({
                    path: 'parent',
                    children: [
                        mockRouteConfig({
                            path: 'child/',
                            render: () => safe`<div>Child</div>`,
                        }),
                        mockRouteConfig({
                            path: 'descendant',
                            children: [
                                mockRouteConfig({
                                    path: 'grandchild/',
                                    render: () => safe`<div>Grandchild</div>`,
                                }),
                            ],
                        }),
                    ],
                }),
            ];

            const resources = await arrayFromAsync(generateRoutePages(routes));

            expect(resources).toEqual([
                PrerenderResource.fromHtml(
                    '/parent/child/index.html',
                    safe`<div>Child</div>`,
                ),
                PrerenderResource.fromHtml(
                    '/parent/descendant/grandchild/index.html',
                    safe`<div>Grandchild</div>`,
                ),
            ]);
        });

        it('throws an error for any non-HTML file extension', async () => {
            await expectAsync(arrayFromAsync(generateRoutePages([
                mockRouteConfig({
                    path: 'foo/bar/baz/file.ext',
                    render: () => safe`<div>Hello</div>`,
                }),
            ]))).toBeRejectedWithError(
                /must end in a `\/` or `\.html` extension/);
        });

        it('throws an error for paths with no extension', async () => {
            await expectAsync(arrayFromAsync(generateRoutePages([
                mockRouteConfig({
                    path: 'foo/bar/baz',
                    render: () => safe`<div>Hello</div>`,
                }),
            ]))).toBeRejectedWithError(
                /must end in a `\/` or `\.html` extension/);
        });

        it('parallelizes rendering', async () => {
            let resolveSecondRoute: () => void;
            const secondRoute = new Promise<void>((resolve) => {
                resolveSecondRoute = resolve;
            });

            const routes = [
                mockRouteConfig({
                    path: 'first/',
                    render: async () => {
                        await secondRoute; // Wait for second route to render.
                        return safe`<div>First</div>`;
                    },
                }),
                mockRouteConfig({
                    path: 'second/',
                    render: async () => {
                        await timeout(1);
                        resolveSecondRoute();
                        return safe`<div>Second</div>`;
                    },
                }),
            ];

            const resources = await arrayFromAsync(generateRoutePages(routes));

            expect(resources.length).toBe(2);
            expect(resources[0]).toEqual(PrerenderResource.fromHtml(
                '/second/index.html',
                safe`<div>Second</div>`,
            ));
            expect(resources[1]).toEqual(PrerenderResource.fromHtml(
                '/first/index.html',
                safe`<div>First</div>`,
            ));
        });

        it('ignores non-rendered parent routes', async () => {
            const routes = [
                mockRouteConfig({
                    path: '',
                    render: undefined, // Should be ignored.
                    children: [
                        mockRouteConfig({
                            path: '/child/',
                            render: () => safe`<div>Hello, World!</div>`,
                        }),
                    ],
                }),
            ];

            const resources = await arrayFromAsync(generateRoutePages(routes));

            expect(resources).toEqual([
                PrerenderResource.fromHtml(
                    '/child/index.html',
                    safe`<div>Hello, World!</div>`,
                ),
            ]);
        });

        it('throws for a leaf route without a `render` function', async () => {
            const routes = [
                mockRouteConfig({
                    path: 'parent',
                    children: [
                        mockRouteConfig({
                            path: 'child/',
                            render: undefined,
                        }),
                    ],
                }),
            ];

            await expectAsync(arrayFromAsync(generateRoutePages(routes)))
                .toBeRejectedWithError(
                    /Route "\/parent\/child\/" must have either `render` or `children` defined\./);
        });

        it('supports multiple directories in a single path', async () => {
            const routes = [
                mockRouteConfig({
                    path: 'path/to/dir',
                    children: [
                        mockRouteConfig({
                            path: 'nested/route/',
                            render: () => safe`<div>Hello</div>`,
                        }),
                    ],
                }),
            ];

            const resources = await arrayFromAsync(generateRoutePages(routes));

            expect(resources).toEqual([
                PrerenderResource.fromHtml(
                    '/path/to/dir/nested/route/index.html',
                    safe`<div>Hello</div>`,
                ),
            ]);
        });

        it('supports empty `path`', async () => {
            const routes = [
                mockRouteConfig({
                    path: '',
                    render: () => safe`<div>Hello</div>`,
                }),
            ];

            const resources = await arrayFromAsync(generateRoutePages(routes));

            expect(resources).toEqual([
                PrerenderResource.fromHtml(
                    '/index.html',
                    safe`<div>Hello</div>`,
                ),
            ]);
        });

        it('throws an error when duplicating the same path', async () => {
            const routes = [
                mockRouteConfig({
                    path: '/',
                    render: () => safe`<div>First</div>`,
                }),
                mockRouteConfig({
                    path: '/',
                    render: () => safe`<div>Second</div>`,
                }),
            ];

            await expectAsync(arrayFromAsync(generateRoutePages(routes)))
                .toBeRejectedWithError(
                    /Multiple routes resolved to "\/index.html"\./);
        });

        it('throws an error when duplicating the same path with different syntaxes', async () => {
            const routes = [
                mockRouteConfig({
                    path: '/',
                    render: () => safe`<div>First</div>`,
                }),
                mockRouteConfig({
                    path: 'index.html',
                    render: () => safe`<div>Second</div>`,
                }),
            ];

            await expectAsync(arrayFromAsync(generateRoutePages(routes)))
                .toBeRejectedWithError(
                    /Multiple routes resolved to "\/index.html"\./);
        });

        it('throws an error when duplicating the same path with an empty child path', async () => {
            const routes = [
                mockRouteConfig({
                    path: '/',
                    render: () => safe`<div>First</div>`,
                    children: [
                        mockRouteConfig({
                            path: '',
                            render: () => safe`<div>Second</div>`,
                        }),
                    ],
                }),
            ];

            await expectAsync(arrayFromAsync(generateRoutePages(routes)))
                .toBeRejectedWithError(
                    /Multiple routes resolved to "\/index.html"\./);
        });

        it('invokes `render` function with route information', async () => {
            const renderSpy = jasmine.createSpy<Render>('render')
                .and.returnValue(safe`<div>Hello, World!</div>`);
            const routes = [
                mockRouteConfig({
                    label: 'Parent',
                    path: 'parent/',
                    render: renderSpy,
                    children: [
                        mockRouteConfig({
                            label: 'Child',
                            path: 'child/',
                            render: () => safe`<div>Hello, World!</div>`,
                        }),
                    ],
                }),
            ];

            await arrayFromAsync(generateRoutePages(routes));

            expect(renderSpy).toHaveBeenCalledOnceWith(
                jasmine.objectContaining({
                    label: 'Parent',
                    path: '/parent/',
                    children: [
                        jasmine.objectContaining({
                            label: 'Child',
                            path: '/parent/child/',
                        }),
                    ],
                }),
                [
                    jasmine.objectContaining({
                        label: 'Parent',
                        path: '/parent/',
                        children: [
                            jasmine.objectContaining({
                                label: 'Child',
                                path: '/parent/child/',
                            }),
                        ],
                    }),
                ],
            );
        });

        it('invokes `render` function with linked routes', async () => {
            const renderSpy = jasmine.createSpy<Render>('render')
                .and.returnValue(safe`<div>Hello, World!</div>`);
            const routes = [
                mockRouteConfig({
                    label: 'Parent',
                    path: 'parent/',
                    render: renderSpy,
                    children: [
                        mockRouteConfig({
                            label: 'Child 1',
                            path: 'child/1/',
                            render: () => safe`<div>Hello, World!</div>`,
                        }),
                        mockRouteConfig({
                            label: 'Child 2',
                            path: 'child/2/',
                            render: () => safe`<div>Hello, World!</div>`,
                        }),
                    ],
                }),
            ];

            await arrayFromAsync(generateRoutePages(routes));

            expect(renderSpy).toHaveBeenCalledOnceWith(
                jasmine.objectContaining({
                    label: 'Parent',
                    path: '/parent/',
                    parent: undefined,
                    children: [
                        jasmine.objectContaining({
                            label: 'Child 1',
                            path: '/parent/child/1/',
                            parent: jasmine.objectContaining({
                                label: 'Parent',
                                path: '/parent/',
                                parent: undefined,
                            }),
                        }),
                        jasmine.objectContaining({
                            label: 'Child 2',
                            path: '/parent/child/2/',
                            parent: jasmine.objectContaining({
                                label: 'Parent',
                                path: '/parent/',
                                parent: undefined,
                            }),
                        }),
                    ],
                }),
                [
                    jasmine.objectContaining({
                        label: 'Parent',
                        path: '/parent/',
                        parent: undefined,
                        children: [
                            jasmine.objectContaining({
                                label: 'Child 1',
                                path: '/parent/child/1/',
                                parent: jasmine.objectContaining({
                                    label: 'Parent',
                                    path: '/parent/',
                                    parent: undefined,
                                }),
                            }),
                            jasmine.objectContaining({
                                label: 'Child 2',
                                path: '/parent/child/2/',
                                parent: jasmine.objectContaining({
                                    label: 'Parent',
                                    path: '/parent/',
                                    parent: undefined,
                                }),
                            }),
                        ],
                    }),
                ],
            );
        });

        it('invokes `render` function after resolving child route', async () => {
            const renderSpy = jasmine.createSpy<Render>('render')
                .and.returnValue(safe`<div>Hello, World!</div>`);
            const routes = [
                mockRouteConfig({
                    label: 'Parent',
                    path: 'parent/',
                    children: [
                        mockRouteConfig({
                            label: 'Child',
                            path: 'child/',
                            render: renderSpy,
                        }),
                    ],
                }),
            ];

            await arrayFromAsync(generateRoutePages(routes));

            expect(renderSpy).toHaveBeenCalledOnceWith(
                jasmine.objectContaining({
                    label: 'Child',
                    path: '/parent/child/',
                    parent: jasmine.objectContaining({
                        label: 'Parent',
                        path: '/parent/',
                        children: [
                            jasmine.objectContaining({
                                label: 'Child',
                                path: '/parent/child/',
                            }),
                        ],
                    })
                }),
                [
                    jasmine.objectContaining({
                        label: 'Parent',
                        path: '/parent/',
                        children: [
                            jasmine.objectContaining({
                                label: 'Child',
                                path: '/parent/child/',
                            }),
                        ],
                    }),
                ],
            );
        });

        it('invokes `render` function with routes lacking config-only properties', async () => {
            const renderSpy = jasmine.createSpy<Render>('render')
                .and.returnValue(safe`<div>Hello</div>`);
            const routes = [
                mockRouteConfig({
                    label: 'Render',
                    path: '',
                    render: renderSpy,
                    hiddenChild: false,
                }),
            ];

            await arrayFromAsync(generateRoutePages(routes));
            const [ currentRoute, rootRoutes ] = renderSpy.calls.first().args;

            expect(currentRoute).toEqual(jasmine.objectContaining({
                label: 'Render',
                path: '/',
            }));
            expect(currentRoute).not.toEqual(jasmine.objectContaining({
                render: jasmine.any(Function),
                hiddenChild: false,
            }));

            expect(rootRoutes).toEqual([
                jasmine.objectContaining({
                    label: 'Render',
                    path: '/',
                }),
            ]);
            expect(rootRoutes).not.toEqual([
                jasmine.objectContaining({
                    render: jasmine.any(Function),
                    hiddenChild: false,
                }),
            ]);
        });

        it('hides hidden routes from `render` function inputs', async () => {
            const visibleSpy = jasmine.createSpy<Render>('visibleRender')
                .and.returnValue(safe`<div>Hello, World!</div>`);
            const hiddenSpy = jasmine.createSpy<Render>('hiddenRender')
                .and.returnValue(safe`<div>Hello, World!</div>`);

            const routes = [
                mockRouteConfig({
                    path: 'parent',
                    children: [
                        mockRouteConfig({
                            path: 'visible/',
                            render: visibleSpy,
                        }),
                        mockRouteConfig({
                            path: 'hidden/',
                            render: hiddenSpy,
                            hiddenChild: true,
                        }),
                    ],
                }),
            ];

            await arrayFromAsync(generateRoutePages(routes));

            expect(visibleSpy).toHaveBeenCalledOnceWith(
                jasmine.objectContaining({
                    path: '/parent/visible/',
                    parent: jasmine.objectContaining({
                        path: '/parent',
                        children: [
                            jasmine.objectContaining({
                                path: '/parent/visible/',
                            }),
                            // No `/parent/hidden/` route.
                        ],
                    }),
                }),
                [
                    jasmine.objectContaining({
                        path: '/parent',
                        children: [
                            jasmine.objectContaining({
                                path: '/parent/visible/',
                            }),
                            // No `/parent/hidden/` route.
                        ],
                    }),
                ],
            );

            expect(hiddenSpy).toHaveBeenCalledOnceWith(
                // Self-link to the hidden route.
                jasmine.objectContaining({
                    path: '/parent/hidden/',
                }),
                [
                    jasmine.objectContaining({
                        path: '/parent',
                        children: [
                            jasmine.objectContaining({
                                path: '/parent/visible/',
                            }),
                            // No `/parent/hidden/` route.
                        ],
                    }),
                ],
            );
        });

        // A separate code path is needed to remove hidden routes from the
        // top-level route config array.
        it('hides top-level hidden routes from `render` function inputs', async () => {
            const visibleSpy = jasmine.createSpy<Render>('visibleRender')
                .and.returnValue(safe`<div>Hello, World!</div>`);
            const hiddenSpy = jasmine.createSpy<Render>('hiddenRender')
                .and.returnValue(safe`<div>Hello, World!</div>`);

            const routes = [
                mockRouteConfig({
                    path: 'visible/',
                    render: visibleSpy,
                }),
                mockRouteConfig({
                    path: 'hidden/',
                    render: hiddenSpy,
                    hiddenChild: true,
                }),
            ];

            await arrayFromAsync(generateRoutePages(routes));

            expect(visibleSpy).toHaveBeenCalledOnceWith(
                jasmine.objectContaining({
                    path: '/visible/',
                    parent: undefined,
                }),
                [
                    jasmine.objectContaining({
                        path: '/visible/',
                    }),
                    // No `/hidden/` route.
                ],
            );

            expect(hiddenSpy).toHaveBeenCalledOnceWith(
                // Self-link to the hidden route.
                jasmine.objectContaining({
                    path: '/hidden/',
                    parent: undefined,
                }),
                [
                    jasmine.objectContaining({
                        path: '/visible/',
                        parent: undefined,
                    }),
                    // No `/hidden/` route.
                ],
            );
        });

        it('hides a subtree when `hiddenChild` is placed on a parent route', async () => {
            const visibleChildSpy =
                jasmine.createSpy<Render>('visibleChildRender')
                    .and.returnValue(safe`<div>Hello, World!</div>`);
            const hiddenChildSpy =
                jasmine.createSpy<Render>('hiddenChildRender')
                    .and.returnValue(safe`<div>Hello, World!</div>`);

            const routes = [
                mockRouteConfig({
                    path: 'visible/',
                    render: () => safe`<div>Hello, World!</div>`,
                }),
                mockRouteConfig({
                    path: 'hiddenParent/',
                    hiddenChild: true,
                    children: [
                        mockRouteConfig({
                            path: 'visibleChild/',
                            render: visibleChildSpy,
                        }),
                        mockRouteConfig({
                            path: 'hiddenChild/',
                            render: hiddenChildSpy,
                            hiddenChild: true,
                        }),
                    ],
                }),
            ];

            await arrayFromAsync(generateRoutePages(routes));

            expect(visibleChildSpy).toHaveBeenCalledOnceWith(
                jasmine.objectContaining({
                    path: '/hiddenParent/visibleChild/',
                    parent: jasmine.objectContaining({
                        path: '/hiddenParent/',
                        children: [
                            jasmine.objectContaining({
                                path: '/hiddenParent/visibleChild/',
                            }),
                            // No `/hiddenParent/hiddenChild/`.
                        ],
                    }),
                }),
                [
                    jasmine.objectContaining({
                        path: '/visible/',
                    }),
                    // No `/hiddenParent/` route.
                ],
            );

            expect(hiddenChildSpy).toHaveBeenCalledOnceWith(
                // Self-link to the hidden route.
                jasmine.objectContaining({
                    path: '/hiddenParent/hiddenChild/',
                    parent: jasmine.objectContaining({
                        path: '/hiddenParent/',
                        children: [
                            jasmine.objectContaining({
                                path: '/hiddenParent/visibleChild/',
                            }),
                            // No `/hiddenParent/hiddenChild/`.
                        ],
                    }),
                }),
                [
                    jasmine.objectContaining({
                        path: '/visible/',
                    }),
                    // No `/hiddenParent/` route.
                ],
            );
        });

        it('maintains referential equality between the current route tree and the root routes forest', async () => {
            const renderSpy = jasmine.createSpy<Render>('render')
                .and.returnValue(safe`<div>Hello, World!</div>`);
            const routes = [
                mockRouteConfig({
                    path: 'parent',
                    children: [
                        mockRouteConfig({
                            path: 'child/',
                            render: renderSpy,
                        }),
                    ],
                }),
            ];

            await arrayFromAsync(generateRoutePages(routes));

            const [ currentRoute, rootRoutes ] = renderSpy.calls.first().args;
            const parentFromRootForest = rootRoutes[0]!;
            const childFromRootForest = parentFromRootForest.children![0];
            const parentFromCurrentTree = currentRoute.parent!;
            const childFromCurrentTree = currentRoute;

            expect(parentFromRootForest).toBe(parentFromCurrentTree);
            expect(childFromRootForest).toBe(childFromCurrentTree);
        });

        it('throws an error when render function does not return `SafeHtml`', async () => {
            const routes = [
                mockRouteConfig({
                    render: () => '<div>Not safe!</div>' as unknown as SafeHtml,
                }),
            ];

            await expectAsync(arrayFromAsync(generateRoutePages(routes)))
                .toBeRejectedWithError(/Only `SafeHtml` objects can be used/);
        });
    });

    describe('bootstrap', () => {
        it('bootstraps the route rendering process', async () => {
            const routes = [
                mockRouteConfig({
                    path: '',
                    render: () => safe`<div>Hello</div>`,
                }),
            ];

            const generator = bootstrap(routes);

            await expectAsync(arrayFromAsync(generator())).toBeResolvedTo([
                PrerenderResource.fromHtml(
                    '/index.html',
                    safe`<div>Hello</div>`,
                ),
            ]);
        });
    });
});

function timeout(ms: number): Promise<void> {
    return new Promise<void>((resolve) => {
        setTimeout(() => void resolve(), ms);
    });
}
