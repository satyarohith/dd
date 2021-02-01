import {
  json,
  PathParams,
  serve,
  validateRequest,
} from "https://deno.land/x/sift@0.1.3/mod.ts";
import { nanoid } from "https://cdn.esm.sh/v14/nanoid@3.1.20/esnext/nanoid.js";

serve({
  "/:code": handleCodeReqs,
  "/api/create": handleCreate,
});

/** API Handlers -- start. */
async function handleCreate(request: Request) {
  const { error } = await validateRequest(request, {
    GET: {
      params: ["url"],
    },
  });
  if (error) {
    return json({ error: error.message }, { status: error.status });
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code") ?? nanoid(6);
  const url = searchParams.get("url")!;
  const resCode = await findCode(url);
  if (resCode) {
    return json({ code: resCode, url }, { status: 200 });
  }

  return json(await add(url, code), { status: 201 });
}

async function handleCodeReqs(request: Request, params?: PathParams) {
  const { error } = await validateRequest(request, { GET: {} });
  if (error) {
    return json({ error: error.message }, { status: error.status });
  }

  const { code = "" } = params as { code: string };
  if (code) {
    const url = await findUrl(code);
    if (url) {
      return Response.redirect(url, 307);
    }
  }

  return json({ error: "page not found" }, { status: 404 });
}
/** API Handlers -- end. */

/** Fauna related code -- start. */
/** Stores the code as key and url as value. */
const codeKV: { [key: string]: string } = {};
/** Stores the url as key and code as value. */
const urlKV: { [key: string]: string } = {};

const findUrlQuery = gql`
  query($code: String!) {
    findUrlByCode(code: $code) {
      url
    }
  }
`;
async function findUrl(code: string): Promise<string | null> {
  if (codeKV[code]) {
    return codeKV[code];
  }

  const { data } = (await queryFauna(findUrlQuery, { code })) as {
    data: { findUrlByCode: { url: string } };
  };
  if (data?.findUrlByCode?.url) {
    codeKV[code] = data?.findUrlByCode.url;
    return data?.findUrlByCode.url;
  }

  return null;
}

const findCodeQuery = gql`
  query($url: String!) {
    findCodeByUrl(url: $url) {
      code
    }
  }
`;
async function findCode(url: string): Promise<string | null> {
  if (urlKV[url]) {
    return urlKV[url];
  }

  const { data } = (await queryFauna(findCodeQuery, { url })) as {
    data: { findCodeByUrl: { code: string } };
  };
  if (data?.findCodeByUrl?.code) {
    urlKV[url] = data.findCodeByUrl.code;
    return data.findCodeByUrl.code;
  }

  return null;
}

const createLinkQuery = gql`
  mutation($url: String!, $code: String!) {
    createLink(data: { url: $url, code: $code }) {
      code
      url
    }
  }
`;
async function add(
  url: string,
  code: string,
): Promise<{ code: string; url: string }> {
  const { data: { createLink } } =
    (await queryFauna(createLinkQuery, { url, code })) as {
      data: { createLink: { url: string; code: string } };
    };

  codeKV[code] = createLink?.url;
  urlKV[url] = createLink?.code;
  return createLink;
}

/** This is a wrapper function to get formatting and syntax work for graphql in vscode. */
function gql(template: TemplateStringsArray) {
  return template.join("");
}

async function queryFauna(
  query: string,
  variables: { [key: string]: unknown },
): Promise<{
  data?: unknown;
  error?: { message: string };
}> {
  const token = Deno.env.get("FAUNA_SECRET");
  if (!token) {
    throw new Error("environment variable FAUNA_SECRET not set");
  }

  try {
    const res = await fetch("https://graphql.fauna.com/graphql", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const { data, errors } = await res.json();
    if (errors) {
      return { data, error: errors[0] };
    }

    return { data };
  } catch (error) {
    return { error };
  }
}
