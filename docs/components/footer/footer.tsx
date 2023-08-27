import { Template, inlineStyle } from '@rules_prerender/preact';
import { VNode } from 'preact';

/** Renders the page footer section. */
export function Footer(): VNode {
    return <footer>
        <Template shadowrootmode="open">
            {inlineStyle('./footer.css', import.meta)}

            <ul>
                <li>
                    <a href="https://github.com/dgp1130/rules_prerender/"
                        rel="noopener"
                        target="_blank">
                        GitHub
                    </a>
                </li>
                <li>Copyright <code>rules_prerender</code> 2023</li>
                <li><a href="/privacy/" rel="noopener">Privacy Policy</a></li>
            </ul>
        </Template>
    </footer>;
}
