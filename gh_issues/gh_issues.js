import { serve } from "https://deno.land/x/sift@0.1.1/mod.js";
import homePage from "./pages/home.jsx";
import notFoundPage from "./pages/404.jsx";
import issuesEndpoint from "./pages/api/issues.js";

serve({
  "/": homePage,
  "/api/issues": issuesEndpoint,
  404: notFoundPage,
});
