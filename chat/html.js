import { h } from "https://cdn.skypack.dev/preact";
import render from "https://cdn.skypack.dev/preact-render-to-string";
import htm from "https://cdn.skypack.dev/htm";

export const html = htm.bind(h);

export function wrapHTML(markup) {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>denosr</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tailwindcss/ui@latest/dist/tailwind-ui.min.css"/>
  </head>
  <body>
    ${render(markup)}
    <script>fetch("/poll").then(() => location.reload());</script>
  </body>
</html>`;
}
