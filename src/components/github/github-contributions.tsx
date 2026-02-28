import { api } from "@/lib/api/server";
import { serverQueryClient } from "@/lib/query-client";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { GithubAiText } from "./github-ai-text";

export async function GithubContributions() {
  const contributions = await serverQueryClient.fetchQuery({
    queryKey: ["github-contributions"],
    queryFn: async () => {
      let duration = 0;
      const start = new Date();
      const response = await api.github.contributions.get();
      duration = new Date().getTime() - start.getTime();
      return { ...response, duration };
    },
  });

  if (!contributions.data) return null;

  const maxCount = Math.max(...contributions.data.map((d) => d.count), 1);
  const q = maxCount / 4;

  return (
    <section className="flex flex-col gap-2 max-w-full">
      <GithubAiText contributionsRequestDuration={contributions.duration} />

      <div className="relative flex justify-end overflow-x-hidden">
        <div className="absolute left-0 top-0 h-full w-12 bg-linear-to-r from-background to-transparent" />
        <div className="grid grid-rows-7 grid-flow-col gap-0.5 w-fit">
          {contributions.data.map((day, i) => (
            <Tooltip key={day.date || i}>
              <TooltipTrigger
                render={
                  <div
                    key={day.date || i}
                    className={cn(
                      "size-3.5 rounded-xs",
                      day.count === 0
                        ? "bg-foreground/3"
                        : day.count <= q
                        ? "bg-foreground/10"
                        : day.count <= q * 2
                        ? "bg-foreground/23"
                        : day.count <= q * 3
                        ? "bg-foreground/45"
                        : "bg-foreground/65"
                    )}
                  />
                }
              />
              <TooltipContent className="flex items-center gap-1">
                {day.date && (
                  <span className="dark:text-background/60">
                    {format(
                      typeof day.date === "string"
                        ? new Date(day.date.replace(/\//g, "-") + "T12:00:00")
                        : day.date,
                      "MM/dd/yyyy"
                    )}
                  </span>
                )}
                <span>{day.count} contributions</span>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </section>
  );
}
