import { createAnnotation } from 'rules_prerender/common/models/prerender_annotation';
import { SsrComponent } from 'rules_prerender/packages/ssr/ssr_component';

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

export type Branded<Brand extends string, Value> = {
    _brand: Brand;
    _value: Value;
};

export type Slottable<Component extends SsrComponent<unknown, unknown[]>> =
    Branded<Component['name'], string>;

export function slottable<Component extends keyof SsrComponentMap>(
    name: Component,
    content: string,
): Slottable<SsrComponentMap[Component][1]> & { toString(): string } {
    return {
        _brand: name,
        _value: content,
        // TODO: Not included in the Brand type.
        toString: () => content,
    };
}
