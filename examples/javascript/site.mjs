import { PrerenderResource, renderToHtml } from '@rules_prerender/preact';
import { h } from 'preact';
import { Component } from './component/component.mjs';

/* Renders the page. */
export default function* () {
    yield PrerenderResource.fromHtml('/index.html', renderToHtml(
        h('html', {}, [
            h('head', {}, [
                h('meta', { charSet: 'utf8' }),
                h('title', {}, [ 'JavaScript ']),
            ]),
            h('body', {}, [
                h('h2', {}, [ 'JavaScript' ]),
                Component(),
            ]),
        ]),
    ));
}
