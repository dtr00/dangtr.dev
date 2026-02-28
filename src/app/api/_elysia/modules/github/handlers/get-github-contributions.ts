import { gql } from "@apollo/client";
import Elysia from "elysia";
import { rateLimit } from "elysia-rate-limit";
import z from "zod";
import { githubClient } from "../client";

function getWeekday(dateStr: string): number {
  return new Date(dateStr + "T00:00:00Z").getUTCDay();
}

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
    const now = new Date();
    const to = now.toISOString().slice(0, 10);
    const from = new Date(now);
    from.setMonth(from.getMonth() - 7);
    from.setDate(from.getDate() - 7);
    const fromStr = from.toISOString().slice(0, 10);

    const { data } = await githubClient.query({
      query: GITHUB_CONTRIBUTIONS_QUERY,
      variables: {
        username: "dtr00",
        from: fromStr + "T00:00:00Z",
        to: to + "T23:59:59Z",
      },
    });

    const validated = graphQLResponseSchema.safeParse(data);
    if (!validated.success) {
      return status(500, {
        error: "Failed to validate graphQL response",
      });
    }

    const weeks =
      validated.data.user.contributionsCollection.contributionCalendar.weeks;
    const contributions: { date: string; count: number }[] = [];

    for (const week of weeks) {
      const dayMap = new Map<number, { date: string; count: number }>();
      for (const day of week.contributionDays) {
        dayMap.set(getWeekday(day.date), {
          date: day.date.replace(/-/g, "/"),
          count: day.contributionCount,
        });
      }

      for (let d = 0; d < 7; d++) {
        contributions.push(dayMap.get(d) ?? { date: "", count: 0 });
      }
    }

    const formatted = z.array(contributionsSchema).safeParse(contributions);
    if (!formatted.success) {
      return status(500, {
        error: "Failed to validate formatted contributions",
      });
    }

    return status(200, formatted.data);
  });

const GITHUB_CONTRIBUTIONS_QUERY = gql`
  query GithubContributions(
    $username: String!
    $from: DateTime
    $to: DateTime
  ) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
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
