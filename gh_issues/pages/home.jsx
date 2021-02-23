import { h } from "https://deno.land/x/sift@0.1.1/mod.js";
import Card from "../components/card.jsx";
import Layout from "../components/layout.jsx";
import Search from "../components/search.jsx";
import { getIssues } from "./api/issues.js";
import repositories from "../data/repositories.js";

export default async function homePage(request) {
  const { searchParams } = new URL(request.url);
  let repository = searchParams.get("repository");
  if (!repository) {
    repository = repositories[Math.floor(Math.random() * 500)];
  }

  let issues = [];
  try {
    const result = await getIssues(repository);
    if (result?.error) {
      return new Response(JSON.stringify(result), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      issues = result;
    }
  } catch (error) {
    console.error(JSON.stringify(error));
  }

  return (<Layout>
    <div className="container mx-auto max-w-screen-md p-4">
      <a className="text-3xl" href="/">🔥 Issues</a>
      <Search />
      <h6>
        The most discussed issues of{" "}
        <a
          className="text-blue-400"
          href={"https://github.com/" + repository}
        >
          {repository}
        </a>
        <div>
          {issues.map((issue) => <Card {...issue} />)}
        </div>
      </h6>
    </div>
  </Layout>);
}
