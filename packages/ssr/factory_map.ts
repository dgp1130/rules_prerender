import { SsrFactory, SsrComponent } from 'rules_prerender/packages/ssr/ssr_component';

export class FactoryMap {
    private factory: SsrFactory;
    private map: Map<unknown, SsrComponent> = new Map();

    private constructor({ factory }: { factory: SsrFactory }) {
        this.factory = factory;
    }

    public static from(factory: SsrFactory): FactoryMap {
        return new FactoryMap({ factory });
    }

    public resolve(data: unknown): SsrComponent {
        const component = this.map.get(data) ?? this.factory(data);
        this.map.set(data, component);
        return component;
    }
}
