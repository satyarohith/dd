import { serve, serveStatic } from "https://deno.land/x/sift@0.1.5/mod.ts";
import NotFound from "./pages/404.jsx";
import Home from "./pages/home.jsx";
import OptimisticNihilism from "./pages/optimistic_nihilism.jsx";
import Residency from "./pages/residency.jsx";
import Colorize from "./pages/colorize.jsx";
import Rant from "./pages/rant.jsx";
import IocpLinks from "./pages/iocp_links.jsx";
import Visual from "./pages/visual.jsx";
import MathPage from "./pages/math.jsx";

serve({
  "/": Home,
  "/optimistic_nihilism": OptimisticNihilism,
  "/residency": Residency,
  "/colorize": Colorize,
  "/rant": Rant,
  "/iocp_links": IocpLinks,
  "/math": MathPage,
  "/visual": Visual,
  "/static/:filename+": serveStatic("static", { baseUrl: import.meta.url }),
  // Redirects
  "/rant.html": () => Response.redirect("/rant", 301),
  "/(iocp-links|iocp-links.html)": () => Response.redirect("/iocp_links", 301),
  "/math/index.html": () => Response.redirect("/math", 301),
  // Proxies
  "/colorize/val-imgs/(.*)": (request, params) =>
    fetch(
      new URL(params["0"] ?? "", "https://tinyclouds.org/colorize/val-imgs"),
      request,
    ),
  404: NotFound,
});
