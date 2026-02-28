import Elysia from "elysia";
import { getGithubContributions } from "./handlers/get-github-contributions";

export const githubRoutes = new Elysia({ name: "github" }).group(
  "/github",
  (routes) => routes.use(getGithubContributions)
);
