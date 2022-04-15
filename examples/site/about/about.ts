import { PrerenderResource, inlineStyle } from 'rules_prerender';
import { polyfillDeclarativeShadowDom } from 'rules_prerender/declarative_shadow_dom';
import { baseLayout } from 'rules_prerender/examples/site/components/base/base';
import { srcLink } from 'rules_prerender/examples/site/common/links';

/** Renders the about page. */
export default function*(): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.of(
        '/about/index.html',
        baseLayout('About', () => `
<article>
    <template shadowroot="open">
        ${polyfillDeclarativeShadowDom()}

        <p>This is the about page. It gives additional background on the project
        and this example.</p>

        <img src="/images/icon" />

        <p>This page includes an image resource at <code>/images/icon</code>
        although in source it is called
        <a href="${srcLink('/examples/site/about/logo.png')}" rel="noopener"><code>logo.png</code></a>.
        As part of the build process it gets renamed and propagated to the final
        build directory. This gives developers full control over the URL
        structure of their site. If another file were to be given the same path,
        <code>rules_prerender</code> would throw an error and fail the build
        with a precise error message about the file conflict.</p>

        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nisi ex,
        pellentesque eu dignissim ac, mattis ac felis. Vestibulum congue tellus
        quis lectus hendrerit luctus. Praesent sollicitudin tempor semper.
        Mauris dictum metus a mi maximus ultricies. Phasellus eu congue metus,
        ut posuere lacus. Quisque ornare pulvinar orci, eu tristique massa
        feugiat non. Nulla eleifend velit sed orci scelerisque, vitae fringilla
        dolor bibendum.</p>

        <p>Pellentesque ac purus in lacus molestie sodales imperdiet sit amet
        turpis. Suspendisse tempus ligula efficitur, molestie urna auctor,
        luctus augue. In sagittis fermentum elit, id ullamcorper ante porttitor
        vel. Donec mattis posuere accumsan. Vestibulum vitae fermentum purus,
        nec rhoncus mauris. Donec lacinia, justo vel tempus facilisis, ipsum dui
        posuere elit, a posuere odio diam iaculis velit. Proin vel vestibulum
        erat. Duis semper molestie mattis. Nulla gravida sem vel odio placerat
        consectetur. Vestibulum vestibulum purus nec enim faucibus pellentesque.
        Aenean nec elit interdum, imperdiet tellus eget, convallis lectus.
        Suspendisse eleifend nec quam vel dignissim. Phasellus porttitor semper
        tellus, a dictum erat euismod vitae. Lorem ipsum dolor sit amet,
        consectetur adipiscing elit. Fusce tempus leo ante, in facilisis ante
        lobortis ac.</p>

        <p>Praesent aliquet fringilla dignissim. Aenean dapibus, tortor eget
        finibus hendrerit, tortor diam aliquam nulla, et egestas libero dui non
        velit. Integer pellentesque lobortis mattis. Suspendisse consectetur
        elit augue, id semper elit lobortis vitae. Nulla tempor libero et ex
        finibus, id convallis justo blandit. Ut turpis nisl, faucibus sed
        dignissim quis, venenatis non mi. Curabitur lacinia tincidunt vulputate.
        Proin non vehicula risus, id pharetra lorem.</p>

        ${inlineStyle('rules_prerender/examples/site/about/about.css')}
    </template>
</article>
        `),
    );
}
