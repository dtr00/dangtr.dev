import Elysia from "elysia";
import { getGithubContributions } from "./handlers/get-github-contributions";
import { getGithubRecentCommit } from "./handlers/get-github-recent-commit";

export const githubRoutes = new Elysia({ name: "github" }).group(
  "/github",
  (routes) => routes.use(getGithubContributions).use(getGithubRecentCommit)
);
