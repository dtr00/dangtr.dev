import { createFileRoute } from '@tanstack/react-router'

import ContributionHeatmap from '#/features/github/components/contribution-heatmap'
import HomepageIntro from '#/features/homepage/components/homepage-intro'
import { homepageIntroQuery } from '#/features/homepage/lib/homepage-intro-query'
import ResourcesSection from '#/features/resources/components/resources-section'
import { preloadResourceIcons, ResourceIconSsrProvider } from '#/features/resources/lib/resource-icons'
import { resourcesListQuery } from '#/features/resources/lib/resources-query'
import { getGitHubContributions } from '#/features/github/server/get-github-contributions'
import { renderResourceIconSvgs } from '#/features/resources/server/render-resource-icon-svgs'

export const Route = createFileRoute('/')({
  staleTime: Infinity,
  loader: async ({ context: { queryClient } }) => {
    const [githubData, resources, homepageIntro] = await Promise.all([
      getGitHubContributions(),
      queryClient.ensureQueryData(resourcesListQuery),
      queryClient.ensureQueryData(homepageIntroQuery),
    ])

    const iconNames = resources.map((resource) => resource.icon)

    await preloadResourceIcons(iconNames)

    const resourceIconSvgs = import.meta.env.SSR
      ? renderResourceIconSvgs(iconNames)
      : {}

    return { githubData, resourceIconSvgs, resources, homepageIntro }
  },
  component: Home,
})

function Home() {
  const { githubData, resourceIconSvgs, resources, homepageIntro } =
    Route.useLoaderData()

  return (
    <main className="mx-auto max-w-3xl px-8 py-8">
      <HomepageIntro initialContent={homepageIntro} />
      <ResourceIconSsrProvider svgs={resourceIconSvgs}>
        {githubData ? (
          <ContributionHeatmap
            contributions={githubData.contributions}
            username={githubData.username}
          />
        ) : null}
        <ResourcesSection initialResources={resources} />
      </ResourceIconSsrProvider>
    </main>
  )
}
