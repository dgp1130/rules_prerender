import { JsonObject } from 'rules_prerender/common/models/json';
import { FactoryMap } from 'rules_prerender/packages/ssr/factory_map';
import { SsrComponent, SsrFactory } from 'rules_prerender/packages/ssr/ssr_component';

export class ComponentMap {
    private map: Map<string, FactoryMap> = new Map();

    public resolve<Context>(component: string, data?: JsonObject):
            SsrComponent<Context> | undefined {
        const factoryMap = this.map.get(component);
        if (!factoryMap) return undefined;

        return factoryMap.resolve(data);
    }

    public register<
        PrerenderedData extends JsonObject | undefined,
        Context = void,
    >(
        component: string,
        factory: SsrFactory<PrerenderedData, Context>,
    ): void {
        if (this.map.has(component)) {
            throw new Error(`Registered component "${component}" twice.`);
        }
        const fac = factory as SsrFactory<JsonObject | undefined, Context>;
        this.map.set(component, FactoryMap.from(fac));
    }
}
