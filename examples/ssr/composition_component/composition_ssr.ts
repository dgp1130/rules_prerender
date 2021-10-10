import { ExpressComponent, Slotted, parseOnlySlot, registerExpressComponent, ExpressContext } from 'rules_prerender/packages/express/express';
import { JsonObject } from 'rules_prerender/common/models/json';
import { ComposedSsrComponent } from 'rules_prerender/examples/ssr/composition_component/composed_ssr';

interface PrerenderData extends JsonObject {
    composed: string;
}

class CompositionSsrComponent implements ExpressComponent {
    private constructor(private composed: Slotted<ComposedSsrComponent>) { }

    public static fromPrerendered({ composed }: PrerenderData):
            CompositionSsrComponent {
        const composedComponent =
            parseOnlySlot(composed) as Slotted<ComposedSsrComponent>;
        return new CompositionSsrComponent(composedComponent);
    }

    public *render(ctx: ExpressContext): Generator<string, void, void> {
        yield `<li>SSR: Composition</li>`;
        yield* this.composed.render(ctx, 'Composition');
    }
}

registerExpressComponent(
    'composition', CompositionSsrComponent.fromPrerendered);
