import { FactoryMap } from 'rules_prerender/packages/ssr/factory_map';
import { SsrComponent, SsrFactory } from 'rules_prerender/packages/ssr/ssr_component';

export class ComponentMap {
    private map: Map<string, FactoryMap> = new Map();

    public resolve(component: string, data: unknown): SsrComponent | undefined {
        const factoryMap = this.map.get(component);
        if (!factoryMap) return undefined;

        return factoryMap.resolve(data);
    }

    public register(component: string, factory: SsrFactory): void {
        if (this.map.has(component)) {
            throw new Error(`Registered component "${component}" twice.`);
        }
        this.map.set(component, FactoryMap.from(factory));
    }
}
