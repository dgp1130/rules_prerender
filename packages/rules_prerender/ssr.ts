import { JsonObject } from 'rules_prerender/common/models/json';
import { createAnnotation } from 'rules_prerender/common/models/prerender_annotation';
import { SsrComponent } from 'rules_prerender/packages/ssr/ssr_component';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface SsrComponentMap { }
}

/** TODO */
export function ssr<Component extends keyof SsrComponentMap>(
    component: Component,
    ...args: undefined extends SsrComponentMap[Component][0]
        ? [] | [ undefined ]
        : [ DeepSlottableData<SsrComponentMap[Component][0]> ]
): string {
    const [ data ] = args;
    return createAnnotation({
        type: 'ssr',
        component,
        data: data as JsonObject,
    });
}

type DeepSlottableData<Data> =
    Data extends []
        ? []
        : Data extends [ infer Head, ...infer Tail ]
        ? [ SlottableData<Head>, ...DeepSlottableData<Tail> ]
        : Data extends unknown[]
            ? DeepSlottableData<Data[number]>[]
            : SlottableData<Data> extends never
                ? Data extends {}
                    ? { [Key in keyof Data]: DeepSlottableData<Data[Key]> }
                    : Data
            : SlottableData<Data>;
type SlottableData<SlottedData> =
    // Technically this should be a `Slotted<Component>`, but `Slotted` just
    // wraps the implementation, the type is (relatively) unchanged. Matching on
    // An `SsrComponent` directly is a bit simpler and avoids a weird dependency
    // on `Slotted`.
    SlottedData extends SsrComponent<unknown, unknown[]>
        ? Branded<SlottedData['name'], string>
        : never
;

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
