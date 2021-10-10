import { createAnnotation } from 'rules_prerender/common/models/prerender_annotation';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface SsrComponentMap { }
}

/** TODO: `data` optional based on prerender data of component? */
export function ssr<Component extends keyof SsrComponentMap>(
    component: Component,
    data: SsrComponentMap[Component][0],
): string {
    return createAnnotation({
        type: 'ssr',
        component,
        data,
    });
}
