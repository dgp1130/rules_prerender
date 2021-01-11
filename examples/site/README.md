# Site

This example builds a non-trivial web site with `rule_prerender`. Most examples
focus on a specific feature and just show how to use that, however this example
acts as a full use case of building a web site. The site contents are somewhat
contrived but should use realistic enough patterns to act as a stand-in and
example of a real web site you might see on the internet.

Note that this example uses raw strings for its components at the moment. In a
real-real site you would probably want to use a templating language like
[`lit-html`](https://lit-html.polymer-project.org/) or
[JSX](https://reactjs.org/docs/introducing-jsx.html) to automatically escape
inputs and reduce possible XSS bugs.
