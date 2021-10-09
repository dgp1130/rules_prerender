import { JsonObject } from 'rules_prerender/common/models/json';
import { createAnnotation } from 'rules_prerender/common/models/prerender_annotation';

/** TODO */
export function ssr(component: string, data?: JsonObject): string {
    return createAnnotation({
        type: 'ssr',
        component,
        data,
    });
}
