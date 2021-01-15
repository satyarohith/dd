const token = Deno.env.get("FAUNA_SECRET");

const findUrlQuery = `
query($code: String!) {
    findUrlByCode(code: $code) {
      url
    }
  }
`;

const findCodeQuery = `
query($url: String!) {
    findCodeByUrl(url: $url) {
      code
    }
  }
`;

const createLinkQuery = `
mutation($url: String!, $code: String!) {
    createLink(data: { url: $url, code: $code }) {
      code
      url
    }
  }
`;

/** Stores the code as key and url as value. */
const codeKV: { [key: string]: string } = {};
/** Stores the url as key and code as value. */
const urlKV: { [key: string]: string } = {};

async function findUrl(code: string): Promise<string | null> {
  if (codeKV[code]) {
    return codeKV[code];
  } else {
    const { findUrlByCode } = await queryFuana(findUrlQuery, { code });
    if (findUrlByCode?.url) {
      codeKV[code] = findUrlByCode.url;
      return findUrlByCode.url;
    }

    return null;
  }
}

async function queryFuana(query: string, variables: unknown) {
  try {
    const res = await fetch("https://graphql.fauna.com/graphql", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        query,
        variables
      })
    });
    if (res.ok) {
      const { data } = await res.json();
      return data;
    }
  } catch (error) {
    console.error(error);
  }

  return {};
}

async function findCode(url: string): Promise<string | null> {
  if (urlKV[url]) {
    return urlKV[url];
  } else {
    const { findCodeByUrl } = await queryFuana(findCodeQuery, { url });
    if (findCodeByUrl?.code) {
      urlKV[url] = findCodeByUrl.code;
      return findCodeByUrl.code;
    }

    return null;
  }
}

async function add(url: string, code: string) {
  const result = await queryFuana(createLinkQuery, { url, code });
  codeKV[code] = result?.url;
  urlKV[url] = result?.code;
  return result;
}

export { add, findCode, findUrl };
