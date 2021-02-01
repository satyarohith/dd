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

  const { data } = (await queryFuana(findUrlQuery, { code })) as {
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

  const { data } = (await queryFuana(findCodeQuery, { url })) as {
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
  const { data } = (await queryFuana(createLinkQuery, { url, code })) as {
    data: { url: string; code: string };
  };

  codeKV[code] = data?.url;
  urlKV[url] = data?.code;
  return data;
}

/** This is a wrapper function to get formatting and syntax work for graphql in vscode. */
function gql(template: TemplateStringsArray) {
  return template.join("");
}

async function queryFuana(
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

export { add, findCode, findUrl };
