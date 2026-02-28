import "server-only";

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

const GH_TOKEN = process.env.GH_TOKEN;
if (!GH_TOKEN) throw new Error("GITHUB_TOKEN is not set");

export const githubClient = new ApolloClient({
  link: new HttpLink({
    uri: "https://api.github.com/graphql",
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
    },
  }),
  cache: new InMemoryCache(),
});
