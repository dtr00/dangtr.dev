import { Elysia } from "elysia";
import { githubRoutes } from "../_elysia/modules/github/routes";

const app = new Elysia({ name: "api", prefix: "/api" }).use(githubRoutes);

export const GET = app.fetch;
