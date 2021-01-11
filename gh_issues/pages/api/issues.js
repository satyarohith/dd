export async function getIssues(repository = "denoland/deno") {
  const token = Deno.env.get("GITHUB_TOKEN");
  if (!token) {
    return { error: "Environment variable GITHUB_TOKEN not set." };
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${repository}/issues?sort=comments&per_page=10&state=all`,
      {
        method: "GET",
        headers: {
          "User-Agent": "dbot",
          Accept: "application/vnd.github.v3+json",
          Authorization: `token ${token}`,
        },
      },
    );

    if (res.ok) {
      const issues = [];
      const issuesFromGH = await res.json();
      for (const issue of issuesFromGH) {
        issues.push({
          url: issue.html_url,
          title: issue.title,
          comments: issue.comments,
          created_at: issue.created_at,
          closed_at: issue.closed_at,
          closed: issue.state === "open" ? false : true,
        });
      }

      return issues;
    }

    if (res.status === 404) {
      return [
        {
          title: `Repository (${repository}) not found`,
          url: "#",
          closed: true,
        },
      ];
    }
  } catch (error) {
    console.error(JSON.stringify(error));
  }

  return [];
}

export default async function issuesEndpoint(request) {
  const { searchParams } = new URL(request.url);
  const issues = await getIssues(searchParams.get("repository"));
  return new Response(JSON.stringify({ issues }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
