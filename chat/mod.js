import { html, wrapHTML } from "./html.js";

const page = (messages) =>
  html`<div class="grid place-items-center p-4">
    <h1 class="text-2xl font-bold">denosr Chat</h1>
    <div class="border w-full max-w-screen-sm rounded-b-3xl rounded-t-md">
      <div class="h-64 px-2">
        ${
    messages.map(
      (message) =>
        html`<div
              class="mt-2 rounded-t-full rounded-br-full px-2 py-1 w-max-content shadow"
            >
              ${message}
            </div>`,
    )
  }
      </div>
      <form class="grid relative text-gray-600" action="/send">
        <input
          class="form-input rounded-full"
          placeholder="Message"
          name="message"
        />
        <div class="absolute top-0 right-0 mt-3 mr-4">
          <button>
            <svg
              class="w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M0 0l20 10L0 20V0zm0 8v4l10-2L0 8z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  </div>`;

const messages = [];
const listeners = {};
let id = 0;

addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const { pathname: path } = url;

  if (path === "/") {
    event.respondWith(
      new Response(wrapHTML(page(messages)), {
        headers: { "content-type": "text/html" },
      }),
    );
  } else if (path === "/send") {
    messages.push(url.searchParams.get("message"));
    Object.values(listeners).forEach((d) => {
      d.resolve();
    });
    event.respondWith(Response.redirect("/", 303));
  } else if (path === "/poll") {
    const poll = deferred();
    const id_ = id;
    listeners[id_] = poll;
    console.log("s", Object.keys(listeners));
    id++;
    poll.then(() => {
      delete listeners[id_];
      console.log("e", Object.keys(listeners));
      event.respondWith(new Response("", { status: 200 }));
    });
  } else {
    event.respondWith(
      new Response(
        wrapHTML(html`<div class="text-2xl font-bold m-8">404 Not Found</div>`),
        {
          status: 404,
          headers: { "content-type": "text/html" },
        },
      ),
    );
  }
});

export function deferred() {
  let methods;
  const promise = new Promise((resolve, reject) => {
    methods = { resolve, reject };
  });
  return Object.assign(promise, methods);
}
