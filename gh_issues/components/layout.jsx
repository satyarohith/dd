import { h } from "https://deno.land/x/sift@0.1.1/mod.js";

export default function Layout({ children }) {
  return (<html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, shrink-to-fit=no"
      />
      <link
        rel="stylesheet"
        href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css"
      />
    </head>
    <body>
      {children}
    </body>
  </html>);
}
