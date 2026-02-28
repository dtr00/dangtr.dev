import { gql } from "@apollo/client";
import Elysia from "elysia";
import { rateLimit } from "elysia-rate-limit";
import z from "zod";
import { githubClient } from "../client";

export const getGithubContributions = new Elysia({
  name: "get-github-contributions",
})
  .use(
    rateLimit({
      duration: 30 * 1000, // 30 seconds
      max: 30,
    })
  )
  .get("/contributions", async ({ status }) => {
    const { data } = await githubClient.query({
      query: GITHUB_CONTRIBUTIONS_QUERY,
      variables: {
        username: "dtr00",
      },
    });

    const validated = graphQLResponseSchema.safeParse(data);
    if (!validated.success) {
      return status(500, {
        error: "Failed to validate graphQL response",
      });
    }

    // format data for heatmap component
    const contributions =
      validated.data.user.contributionsCollection.contributionCalendar.weeks.flatMap(
        (week) =>
          week.contributionDays.map((day) => ({
            date: day.date.replace(/-/g, "/"), // format date to YYYY/MM/DD
            count: day.contributionCount,
          }))
      );

    const formatted = z.array(contributionsSchema).safeParse(contributions);
    if (!formatted.success) {
      return status(500, {
        error: "Failed to validate formatted contributions",
      });
    }

    return status(200, formatted.data);
  });

const GITHUB_CONTRIBUTIONS_QUERY = gql`
  query GithubContributions($username: String!) {
    user(login: $username) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

const contributionsSchema = z.object({
  date: z.string(),
  count: z.number(),
});

const graphQLResponseSchema = z.object({
  user: z.object({
    contributionsCollection: z.object({
      contributionCalendar: z.object({
        weeks: z.array(
          z.object({
            contributionDays: z.array(
              z.object({
                date: z.string(),
                contributionCount: z.number(),
              })
            ),
          })
        ),
      }),
    }),
  }),
});
