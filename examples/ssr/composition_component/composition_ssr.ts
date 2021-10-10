import { ExpressComponent, Slotted, registerExpressComponent, ExpressContext } from 'rules_prerender/packages/express/express';
import { ComposedSsrComponent } from 'rules_prerender/examples/ssr/composition_component/composed_ssr';

interface PrerenderData {
    composed: Slotted<ComposedSsrComponent>;
}

export class CompositionSsrComponent implements ExpressComponent {
    private constructor(private composed: Slotted<ComposedSsrComponent>) { }

    public readonly name = 'composition';

    public static fromPrerendered({ composed }: PrerenderData):
            CompositionSsrComponent {
        return new CompositionSsrComponent(composed);
    }

    public *render(ctx: ExpressContext): Generator<string, void, void> {
        yield `<li>SSR: Composition</li>`;
        yield* this.composed.render(ctx, 'Composition');
    }
}

registerExpressComponent(
    'composition', CompositionSsrComponent.fromPrerendered);

declare global {
    interface SsrComponentMap {
        'composition': [ PrerenderData, CompositionSsrComponent ];
    }
}
