import { json, serve } from "https://deno.land/x/sift@0.1.2/mod.ts";
import { nanoid } from "https://cdn.esm.sh/v14/nanoid@3.1.20/esnext/nanoid.js";
import { add, findCode, findUrl } from "./db.ts";

serve({
  "/:code": handleCodeReqs,
  "/api/create": handleCreate,
});

async function handleCreate(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code") ?? nanoid(6);
  const url = searchParams.get("url");
  if (!url) {
    return json({ error: "url query is required" }, { status: 400 });
  }

  const resCode = await findCode(url);
  if (resCode) {
    return json({ code: resCode, url }, { status: 200 });
  }

  return json(await add(url, code), { status: 201 });
}

async function handleCodeReqs(
  _req: Request,
  params?: { [key: string]: string },
) {
  const { code = "" } = params as { code: string };

  if (code) {
    const url = await findUrl(code);
    if (url) {
      return Response.redirect(url, 307);
    }
  }

  return json({ error: "page not found" }, { status: 404 });
}
