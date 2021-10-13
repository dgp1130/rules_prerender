import { ExpressComponent, Slotted, registerExpressComponent, ExpressContext } from 'rules_prerender/packages/express/express';
import { InnerSsrComponent } from 'rules_prerender/examples/ssr/composition_component/inner_ssr';

interface PrerenderData {
    composed: Slotted<InnerSsrComponent>;
}

export class OuterSsrComponent implements ExpressComponent {
    private constructor(private composed: Slotted<InnerSsrComponent>) { }

    public readonly name = 'outer';

    public static fromPrerendered({ composed }: PrerenderData):
            OuterSsrComponent {
        return new OuterSsrComponent(composed);
    }

    public *render(ctx: ExpressContext): Generator<string, void, void> {
        yield `<li>SSR: Outer component</li>`;
        yield* this.composed.render(ctx, 'Outer component');
    }
}

registerExpressComponent(
    'outer', OuterSsrComponent.fromPrerendered);

declare global {
    interface SsrComponentMap {
        'outer': [ PrerenderData, OuterSsrComponent ];
    }
}
