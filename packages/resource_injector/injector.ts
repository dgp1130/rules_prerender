import * as path from 'path';
import { HTMLElement, parse, CommentNode, Node } from 'node-html-parser';
import * as fs from 'rules_prerender/common/fs';
import { InjectorConfig, InjectScript, InjectStyle } from 'rules_prerender/packages/resource_injector/config';
import { parseAnnotation, StyleInjection } from 'rules_prerender/common/models/prerender_annotation';

/**
 * Parses the given HTML document and injects all the resources specified by the
 * {@link InjectorConfig}, then returns the new document as a string. Little to
 * no effort has been made for indentation of the new elements to look
 * reasonable.
 * 
 * @param html The HTML document to inject resources into.
 * @param config An {@link InjectorConfig} listing all the resources to be
 *     injected into the HTML document.
 * @returns A new HTML document with all the resources injected into it.
 */
export async function inject(
    html: string,
    config: InjectorConfig,
    deps: Set<string>,
    inlineRoot: string,
    workspace: string,
): Promise<string> {
    // Parse input HTML.
    const root = parse(html, {
        comment: true,
        blockTextElements: {
            script: true,
            noscript: true,
            style: true,
            pre: true,
        },
    });

    // Inject all resources.
    for (const action of config) {
        switch (action.type) {
            case 'script': {
                injectScript(root, action);
                break;
            } case 'style': {
                await injectStyle(root, action);
                break;
            } default: {
                assertNever(action);
            }
        }
    }

    await injectInlineStyles(root, deps, inlineRoot, workspace);

    // Return the new document.
    return root.toString();
}

/**
 * Returns the `<head />` element of the given document. If one does not exist,
 * it is created and injected as the first child of the `<html />` element.
 * 
 * @param root The root element of the HTML document to get the `<head />`
 *     element of.
 * @returns The `<head />` element of the given HTML document.
 * @throws When `<head />` element does not exist and an `<html />` element to
 *     inject one into cannot be found.
 */
function getOrInjectHead(root: HTMLElement): HTMLElement {
    const existingHead = root.querySelector('head');
    if (existingHead) return existingHead;

    const head = new HTMLElement('head', {});
    const html = root.querySelector('html');
    if (!html) throw new Error('<html /> element could not be found.');

    html.childNodes = [ head, ...html.childNodes ];
    head.insertAdjacentHTML('afterbegin', '\n');
    html.insertAdjacentHTML('afterbegin', '\n');
    return head;
}

/**
 * Appends a `<script />` tag for the provided script to the `<head />` tag of
 * the provided HTML document.
 * 
 * @param root The root element of the HTML document to inject the script into.
 * @param action Metadata about the script tag to create.
 */
function injectScript(root: HTMLElement, action: InjectScript): void {
    const head = getOrInjectHead(root);

    // Insert a `<script />` tag at the end of the `<head />` element.
    const script = new HTMLElement('script', {});
    script.setAttribute('src', action.path);
    script.setAttribute('async', '');
    script.setAttribute('defer', '');
    head.appendChild(script);

    // Insert a trailing newline so subsequent insertions look a little better.
    script.insertAdjacentHTML('afterend', '\n');
}

/**
 * Appends a `<style />` tag for the provided CSS to the `<head />` tag of the
 * provided HTML document. This tag inlines the content of the file at the
 * provided path.
 * 
 * @param root The root element of the HTML document to inject the script into.
 * @param action Metadata about the `<style />` tag to create.
 */
async function injectStyle(root: HTMLElement, { path }: InjectStyle):
        Promise<void> {
    const head = getOrInjectHead(root);

    // Read the CSS contents from the given file path.
    const css = await fs.readFile(path, { encoding: 'utf8' });

    // Insert a `<style />` tag at the end of the `<head />` element with the
    // CSS content inlined.
    const style = new HTMLElement('style', {});
    style.set_content(css);
    head.appendChild(style);

    // Insert a trailing newline so subsequent insertions look a little better.
    style.insertAdjacentHTML('afterend', '\n');
}

async function injectInlineStyles(
    root: HTMLElement,
    deps: Set<string>,
    inlineRoot: string,
    workspace: string,
): Promise<void> {
    const depMap = genDepMap(deps, inlineRoot, workspace);

    for (const [ comment, parent ] of walkComments(walk(root))) {
        if (!parent) throw new Error('Found comment node with no parent.');
        const annotation = parseAnnotation(comment.text);
        if (!annotation) continue; // Ignore if not an annotation.

        // Ignore annotations that aren't inline style injections.
        if (annotation.type !== 'style'
                || annotation.injection !== StyleInjection.Inline) {
            continue;
        }

        // Replace the annotation with the an inline `<style></style>` tag.
        const path = depMap.get(annotation.path);
        if (!path) throw new Error(`Failed to resolve inline style \`${
            annotation.path}\`. Possible files include:\n${
            Array.from(depMap.entries()).map(([rootRelative]) => rootRelative).join('\n')}`);
        const css = await fs.readFile(depMap.get(annotation.path)!, 'utf8');
        const style = new HTMLElement('style', {}, undefined, parent);
        style.set_content(css);
        parent.exchangeChild(comment, style);
    }
}

/**
 * Filters the given {@link Iterable} of {@link Node} to limit to only comment
 * nodes.
 */
function* walkComments(
    nodes: Iterable<[ Node, HTMLElement | undefined /* parent */ ]>,
): Iterable<[ CommentNode, HTMLElement | undefined /* parent */ ]> {
    for (const [ node, parent ] of nodes) {
        if (node instanceof CommentNode) {
            yield [ node, parent ];
        }
    }
}

/**
 * Returns an {@link Iterable} of all the {@link Node} descendants of the given
 * root and their parent.
 */
function* walk(root: Node, parent?: HTMLElement):
        Iterable<[ Node, HTMLElement | undefined /* parent */ ]> {
    yield [ root, parent ];
    if (root instanceof HTMLElement) {
        for (const node of root.childNodes) {
            yield* walk(node, root);
        }
    }
}

function genDepMap(
    deps: Set<string>,
    inlineRoot: string,
    workspace: string,
): Map<string, string> {
    const depMap = new Map<string, string>();

    for (const dep of deps) {
        // TODO: External dependencies.
        const rootRelative = dep.startsWith('bazel-out')
            ? dep.split('/').slice(3).join('/')
            : dep;
        if (!rootRelative.startsWith(inlineRoot)) {
            throw new Error(`CSS dependency \`${dep}\` is not under inline root \`${inlineRoot}\`.`);
        }
        const inlineRootRelative = rootRelative.slice(inlineRoot.length);
        const execrootRelative = path.join(workspace, inlineRootRelative);

        // Check for duplicates.
        const existing = depMap.get(execrootRelative);
        if (existing) throw new Error(`Multiple files resolved root-relative paths to ${rootRelative}: \`${existing}\` and \`${dep}\`. Only one is allowed.`);

        depMap.set(execrootRelative, dep);
    }

    return depMap;
}

function assertNever(value: never): never {
    throw new Error(`Unexpected call to \`assertNever()\` with value: ${
        JSON.stringify(value)}`);
}
