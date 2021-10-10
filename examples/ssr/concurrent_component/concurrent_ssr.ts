import { SsrComponent, registerComponent } from 'rules_prerender/packages/ssr/ssr';
import { JsonObject } from 'rules_prerender/common/models/json';

interface PrerenderData extends JsonObject {
    index: number;
}

class ConcurrentSsrComponent implements SsrComponent {
    private constructor(private index: number) { }

    public static fromPrerender({ index }: PrerenderData):
            ConcurrentSsrComponent {
        return new ConcurrentSsrComponent(index);
    }

    public async render(): Promise<string> {
        // Wait a sizeable length of time. Must render a lot of these components
        // concurrently for a reasonable experience.
        await timeout(1_000);

        return `<li>Concurrent ${this.index}</li>`;
    }
}

registerComponent('concurrent', ConcurrentSsrComponent.fromPrerender);

declare global {
    interface SsrComponentMap {
        'concurrent': [ PrerenderData, ConcurrentSsrComponent ];
    }
}

function timeout(millis: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), millis);
    });
}
