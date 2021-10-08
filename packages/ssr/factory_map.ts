import { JsonObject } from 'rules_prerender/common/models/json';
import { SsrFactory, SsrComponent } from 'rules_prerender/packages/ssr/ssr_component';

export class FactoryMap<PrerenderedData extends JsonObject> {
    private factory: SsrFactory<PrerenderedData>;
    private map: Map<unknown, SsrComponent> = new Map();

    private constructor({ factory }: { factory: SsrFactory<PrerenderedData> }) {
        this.factory = factory;
    }

    public static from<PrerenderedData extends JsonObject>(
        factory: SsrFactory<PrerenderedData>,
    ): FactoryMap<PrerenderedData> {
        return new FactoryMap({ factory });
    }

    public resolve(data: PrerenderedData): SsrComponent {
        const component = this.map.get(data) ?? this.factory(data);
        this.map.set(data, component);
        return component;
    }
}
