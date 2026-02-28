import { api } from "@/lib/api/server";
import { serverQueryClient } from "@/lib/query-client";
import { IconGitBranch, IconGitCommit } from "@tabler/icons-react";
import Link from "next/link";

export async function GithubCommit() {
  const commit = await serverQueryClient.fetchQuery({
    queryKey: ["github-commit"],
    queryFn: async () => await api.github.recent.get(),
  });

  if (!commit.data) return null;

  console.log(commit.data);

  return (
    <section className="text-xs text-muted-foreground space-y-1">
      <Link
        href={`https://github.com/dtr00/dangtr.dev/tree/main`}
        className="flex items-center gap-1 w-fit hover:text-foreground"
      >
        <IconGitBranch className="size-4 text-foreground" />
        <span>main</span>
      </Link>

      <Link
        href={commit.data.url}
        className="flex items-center gap-1 w-fit hover:text-foreground"
      >
        <IconGitCommit className="size-4 text-foreground" />
        <code>{commit.data.oidShort}</code>
        <span>{commit.data.message}</span>
      </Link>
    </section>
  );
}
