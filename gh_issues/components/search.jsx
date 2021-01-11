import { h } from "https://deno.land/x/sift@0.1.1/mod.js";

export default function Search() {
  return (
    <div>
      {h(
        "script",
        {},
        `
  function validateForm() {
    const repo = document.forms['search']['repository'].value;
    if (repo.split('/').length !== 2) {
      alert(\`Input should be in the form of 'owner/repository'. No forward slashes at the beginning or end.\`);
      return false;
    }
    return true;
  }
  `,
      )}
      <form
        className="flex items-center mt-8"
        name="search"
        action="/"
        method="get"
        onsubmit="return validateForm()"
      >
        <input
          className="rounded border px-4 h-8 mr-2"
          type="search"
          name="repository"
          placeholder="<owner>/<repo>"
          required
        />
        <button
          className="bg-blue-600 text-white px-2 rounded h-8"
          type="submit"
        >
          Search
        </button>
      </form>
    </div>
  );
}
