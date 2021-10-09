import { ExpressComponent, parseOnlySlot, registerExpressComponent } from 'rules_prerender/packages/express/express';
import { JsonObject } from 'rules_prerender/common/models/json';
import { ComposedSsrComponent } from 'rules_prerender/examples/ssr/composition_component/composed_ssr';

interface PrerenderData extends JsonObject {
    composed: string;
}

class CompositionSsrComponent implements ExpressComponent {
    private constructor(private composed: ComposedSsrComponent) { }

    public static fromPrerendered({ composed }: PrerenderData):
            CompositionSsrComponent {
        // TODO: Cast is wrong, the type is wrapped.
        const composedComponent = parseOnlySlot(composed) as ComposedSsrComponent;
        return new CompositionSsrComponent(composedComponent);
    }

    public render(): string {
        return `
            <li>SSR: Composition</li>
            ${this.composed.render()}
        `.trim();
    }
}

registerExpressComponent<PrerenderData>(
    'composition', CompositionSsrComponent.fromPrerendered);
