import { SsrComponent, registerComponent } from 'rules_prerender/packages/ssr/ssr';
import { JsonObject } from 'rules_prerender/common/models/json';

interface PrerenderData extends JsonObject {
    index: number;
}

class ParallelSsrComponent implements SsrComponent {
    private constructor(private index: number) { }

    public static fromPrerender({ index }: PrerenderData):
            ParallelSsrComponent {
        return new ParallelSsrComponent(index);
    }

    public async render(): Promise<string> {
        // Wait a sizeable length of time. Must render a lot of these components
        // in parallel for a reasonable experience.
        await timeout(1_000);

        return `<li>Parallel ${this.index}</li>`;
    }
}

registerComponent('parallel', ParallelSsrComponent.fromPrerender);

function timeout(millis: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), millis);
    });
}
