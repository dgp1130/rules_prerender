/**
 * @fileoverview Contains the {@link SafeHtml} definition for representing
 * sanitized HTML content as well as some helper utilities for manipulating the
 * object.
 */

/**
 * Tagged template function which returns the given string literal as a
 * {@link SafeHtml} object. Interpolation are not supported and throw if used.
 *
 * Usage:
 *
 * ```typescript
 * const safeHtml: SafeHtml = safe`<div>Hello, World!</div>`;
 * ```
 *
 * This is safe because tagged template literals are invoked with
 * spec-guaranteed separation between string literals and template
 * interpolations. String literals are hard-coded by the developer and cannot
 * have content injected by malicious actors. This means string literals can be
 * trusted as safe HTML as long as there are no interpolations (or they are
 * properly sanitized).
 */
export function safe(literals: TemplateStringsArray, ...args: unknown[]):
        SafeHtml {
    if (args.length !== 0) {
        throw new Error('`safe` template literal only supports a raw string, no interpolations.');
    }
    if (!Object.prototype.hasOwnProperty.call(literals, 'raw')) {
        throw new Error('`safe` must be called as a template literal, not with a standard array.');
    }

    return unsafeTreatStringAsSafeHtml(literals.join(''));
}

/**
 * Converts the given raw, untrusted string into trusted {@link SafeHtml}. This
 * is an **UNSAFE** operation because it converts untrusted content (a raw
 * string) into trusted HTML. If an attacker compromises the input, they will be
 * able to inject malicious content into the HTML. This should *only* be used
 * when the input is coming from another trusted format (such as a Lit
 * `TemplateResult`) and *never* on end user input.
 */
export function unsafeTreatStringAsSafeHtml(unsanitizedString: string):
        SafeHtml {
    return SafeHtmlImpl.unsafeTrustRawStringContent(unsanitizedString);
}

/**
 * Represents an HTML string which is considered "safe" by construction. It
 * contains HTML content which is safe to render to a browser without further
 * sanitization. This is typically constructed via the {@link safe} function for
 * string literals, or a separate templating engine responsible for sanitization
 * such as `@rules_prerender/lit_engine`.
 */
export type SafeHtml = SafeHtmlImpl;

/** Represents an HTML string which is considered "safe" by construction. */
class SafeHtmlImpl {
    readonly #html: string;

    private constructor({ html }: { html: string }) {
        // Prevent subclassing to avoid malicious code overriding methods.
        if (this.constructor !== SafeHtmlImpl) {
            throw new Error('`SafeHtml` cannot be subclassed.');
        }

        this.#html = html;
    }

    /**
     * Accepts the raw HTML string input as a trusted {@link SafeHtmlImpl}
     * object. This is **UNSAFE** because it effectively "promotes" the raw
     * string to be considered trusted HTML content with no validation or
     * sanitization. This function should only be used on trusted inputs or the
     * output of a sanitized format (such as Lit `TemplateResult`).
     */
    public static unsafeTrustRawStringContent(html: string): SafeHtmlImpl {
        // Clone and freeze the input HTML so the internal reference is not
        // leaked in a way which could be mutated after the fact.
        return Object.freeze(
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-template-expression
            new SafeHtmlImpl({ html: `${html}` }),
        ) as SafeHtmlImpl;
    }

    /**
     * Returns the HTML content as a plain JavaScript string. This effectively
     * _downgrades_ the privilege of the content, but can be useful when passing
     * into an HTML sink API.
     */
    public getHtmlAsString(): string {
        // Clones the string into a new value so the internal reference is not
        // leaked in a way which could be mutated.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-template-expression
        return `${this.#html}`;
    }
}

// Freeze everything so even if malicious code gets a reference to `SafeHtml`,
// it shouldn't be able to compromise the contract.
Object.freeze(SafeHtmlImpl); // The class itself.
Object.freeze(SafeHtmlImpl.prototype); // The `SafeHtml` instance prototype.
Object.freeze(Object.getPrototypeOf(SafeHtmlImpl)); // The class prototype.

/**
 * Returns whether or not the given object is a `SafeHtml` string. Done via an
 * `instanceof` check, meaning this is nominally type checked, not inferred
 * based on the structure of the input.
 */
export function isSafeHtml(obj: unknown): obj is SafeHtml {
    return obj instanceof SafeHtmlImpl;
}
