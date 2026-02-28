import { gql } from "@apollo/client";
import Elysia from "elysia";
import { rateLimit } from "elysia-rate-limit";
import z from "zod";
import { githubClient } from "../client";

export const getGithubRecentCommit = new Elysia({
  name: "get-github-recent-commit",
})
  .use(
    rateLimit({
      duration: 30 * 1000, // 30 seconds
      max: 30,
    })
  )
  .get("/recent", async ({ status }) => {
    const { data } = await githubClient.query({
      query: GITHUB_RECENT_COMMIT_QUERY,
      variables: {
        owner: "dtr00",
        name: "dangtr.dev",
      },
    });

    const validated = graphQLResponseSchema.safeParse(data);
    if (!validated.success) {
      return status(500, {
        error: "Failed to validate graphQL response",
      });
    }

    return status(200, {
      oid: validated.data.repository.defaultBranchRef.target.oid,
      oidShort: validated.data.repository.defaultBranchRef.target.oid.slice(
        0,
        7
      ),
      message: validated.data.repository.defaultBranchRef.target.message,
      committedDate:
        validated.data.repository.defaultBranchRef.target.committedDate,
      url: `https://github.com/dtr00/dangtr.dev/commit/${validated.data.repository.defaultBranchRef.target.oid}`,
    });
  });

const GITHUB_RECENT_COMMIT_QUERY = gql`
  query GithubLatestCommit($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      defaultBranchRef {
        name
        target {
          ... on Commit {
            oid
            message
            committedDate
            author {
              name
              email
            }
          }
        }
      }
    }
  }
`;

const graphQLResponseSchema = z.object({
  repository: z.object({
    defaultBranchRef: z.object({
      name: z.string(),
      target: z.object({
        oid: z.string(),
        message: z.string(),
        committedDate: z.string(),
        author: z.object({
          name: z.string(),
          email: z.email(),
        }),
      }),
    }),
  }),
});
