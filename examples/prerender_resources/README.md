# Prerender Resources

This example uses `prerender_resources()` to generate files at build time. These
files are *not* HTML files and are not processed as such (use
`prerender_pages()` or `prerender_pages_unbundled()` if you want to generate an
HTML page). `prerender_resources()` can generate any arbitrary files, such as
simple text, CSV, or JSON. It can also generate binary files like images,
protocol buffers, or any other useful format.
