import { createAnnotation } from 'rules_prerender/common/models/prerender_annotation';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface SsrComponentMap { }
}

/** TODO */
export function ssr<Component extends keyof SsrComponentMap>(
    component: Component,
    ...[ data ]: undefined extends SsrComponentMap[Component][0]
        ? [] | [ undefined ]
        : [ SsrComponentMap[Component][0] ]
): string {
    return createAnnotation({
        type: 'ssr',
        component,
        data,
    });
}
