import { PrerenderResource } from 'rules_prerender';
import { srcLink } from 'rules_prerender/examples/site/common/links';
import { baseLayout } from 'rules_prerender/examples/site/components/base/base';
import { renderCounter } from 'rules_prerender/examples/site/components/counter/counter_prerender';

/** Renders the counter page. */
export default async function*():
        AsyncGenerator<PrerenderResource, void, void> {
    yield PrerenderResource.of('/counter/index.html', await baseLayout('Counter', () => `
        <article>
            <p>This is a basic JavaScript counter.</p>

            <section>
                ${renderCounter(10)}
            </section>

            <p>The <a href="${srcLink('/examples/site/components/counter/')}" rel="noopener">counter</a>
            is built as a
            <a href="https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements" rel="noopener">custom element</a>
            with prerendered DOM. The label and buttons are rendered at build
            time, even with a default value of 10. JavaScript is loaded lazily
            and the component
            <a href="https://en.wikipedia.org/wiki/Hydration_(web_development)" rel="noopener">hydrates</a>
            itself without requiring any client-side rendering.</p>
        </article>
    `));
}
