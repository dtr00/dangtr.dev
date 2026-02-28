import { GithubCommit } from "@/components/github/github-commit";
import { GithubContributions } from "@/components/github/github-contributions";
import { Intro } from "@/components/intro";

export default function Page() {
  return (
    <>
      <Intro />

      <GithubContributions />

      <GithubCommit />
    </>
  );
}
