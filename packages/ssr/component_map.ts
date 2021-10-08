import { JsonObject } from 'rules_prerender/common/models/json';
import { FactoryMap } from 'rules_prerender/packages/ssr/factory_map';
import { SsrComponent, SsrFactory } from 'rules_prerender/packages/ssr/ssr_component';

export class ComponentMap {
    private map: Map<string, FactoryMap<JsonObject>> = new Map();

    public resolve(component: string, data: JsonObject):
            SsrComponent | undefined {
        const factoryMap = this.map.get(component);
        if (!factoryMap) return undefined;

        return factoryMap.resolve(data);
    }

    public register<PrerenderedData extends JsonObject>(
        component: string,
        factory: SsrFactory<PrerenderedData>,
    ): void {
        if (this.map.has(component)) {
            throw new Error(`Registered component "${component}" twice.`);
        }
        const fac = factory as SsrFactory<JsonObject>;
        this.map.set(component, FactoryMap.from(fac));
    }
}
