import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'

import EditableResourceDescription from '#/features/resources/components/editable-resource-description'
import EditableResourceIcon from '#/features/resources/components/editable-resource-icon'
import EditableResourceName from '#/features/resources/components/editable-resource-name'
import ResourceContentSection from '#/features/resources/components/resource-content-section'
import { useCanEdit } from '#/features/auth/lib/use-can-edit'
import {
  preloadResourceIcons,
  ResourceIcon,
  ResourceIconSsrProvider,
} from '#/features/resources/lib/resource-icons'
import { parseResourceId } from '#/features/resources/lib/parse-resource-id'
import {
  resourceBlocksQuery,
  resourceGetQuery,
} from '#/features/resources/lib/resource-page-query'
import { renderResourceIconSvgs } from '#/features/resources/server/render-resource-icon-svgs'
import type { Id } from '../../../convex/_generated/dataModel'

export const Route = createFileRoute('/resources/$resourceId')({
  staleTime: Infinity,
  loader: async ({ context: { queryClient }, params }) => {
    const resourceId = parseResourceId(params.resourceId)

    if (!resourceId) {
      return { resource: null, blocks: [], resourceIconSvgs: {} }
    }

    const resource = await queryClient.ensureQueryData(
      resourceGetQuery(resourceId),
    )

    if (!resource) {
      return { resource: null, blocks: [], resourceIconSvgs: {} }
    }

    const blocks = await queryClient.ensureQueryData(
      resourceBlocksQuery(resource._id),
    )

    await preloadResourceIcons([resource.icon])

    const resourceIconSvgs = import.meta.env.SSR
      ? renderResourceIconSvgs([resource.icon])
      : {}

    return { resource, blocks, resourceIconSvgs }
  },
  component: ResourcePage,
})

function ResourceNotFound() {
  return (
    <main className="mx-auto max-w-3xl px-8 py-8">
      <p className="text-base text-muted-foreground">Resource not found.</p>
      <Link to="/" className="mt-4 inline-block text-sm text-foreground">
        Back home
      </Link>
    </main>
  )
}

function ResourcePageContent({
  resourceId,
}: {
  resourceId: Id<'resources'>
}) {
  const loaderData = Route.useLoaderData()
  const canEdit = useCanEdit()

  const { data: resource = loaderData.resource } = useQuery({
    ...resourceGetQuery(resourceId),
    initialData: loaderData.resource,
  })

  if (!resource) {
    return <ResourceNotFound />
  }

  return (
    <main className="mx-auto max-w-3xl px-8 py-8">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
        Back
      </Link>
      <ResourceIconSsrProvider svgs={loaderData.resourceIconSvgs}>
        <div className="mt-6 flex gap-3">
          <div className="flex h-8 shrink-0 items-center text-muted-foreground">
            {canEdit ? (
              <EditableResourceIcon
                resourceId={resource._id}
                icon={resource.icon}
              />
            ) : (
              <ResourceIcon
                name={resource.icon}
                size={20}
                stroke={1.75}
                className="size-5"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex min-h-8 items-center">
              {canEdit ? (
                <EditableResourceName
                  resourceId={resource._id}
                  name={resource.name}
                />
              ) : (
                <h1 className="text-lg text-foreground">{resource.name}</h1>
              )}
            </div>
            {canEdit ? (
              <EditableResourceDescription
                resourceId={resource._id}
                description={resource.description}
              />
            ) : resource.description ? (
              <p className="mt-1 text-base text-muted-foreground">
                {resource.description}
              </p>
            ) : null}
          </div>
        </div>
        <ResourceContentSection
          resourceId={resource._id}
          canEdit={canEdit}
          initialBlocks={loaderData.blocks}
        />
      </ResourceIconSsrProvider>
    </main>
  )
}

function ResourcePage() {
  const { resourceId: resourceIdParam } = Route.useParams()
  const resourceId = parseResourceId(resourceIdParam)

  if (!resourceId) {
    return <ResourceNotFound />
  }

  return <ResourcePageContent resourceId={resourceId} />
}
