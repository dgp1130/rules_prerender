import { createAnnotation } from 'rules_prerender/common/models/prerender_annotation';

/** TODO */
export function ssr(component: string, data: unknown): string {
    const annotation = createAnnotation({
        type: 'ssr',
        component,
        data,
    });

    return `<!-- ${annotation} -->`;
}
