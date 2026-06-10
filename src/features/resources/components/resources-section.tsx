import { useQuery } from '@tanstack/react-query'

import AddResourceDialog from '#/features/resources/components/add-resource-dialog'
import ResourceList from '#/features/resources/components/resource-list'
import { useCanEdit } from '#/features/auth/lib/use-can-edit'
import { resourcesListQuery } from '#/features/resources/lib/resources-query'
import type { ResourceListItem } from '#/features/resources/lib/resources-query'

type ResourcesSectionProps = {
  initialResources: ResourceListItem[]
}

export default function ResourcesSection({
  initialResources,
}: ResourcesSectionProps) {
  const canEdit = useCanEdit()
  const { data: resources = initialResources } = useQuery({
    ...resourcesListQuery,
    initialData: initialResources,
  })

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base leading-none text-foreground">My resources</h2>
        <div className="shrink-0">{canEdit ? <AddResourceDialog /> : null}</div>
      </div>
      {resources.length === 0 ? (
        <p className="mt-4 text-base text-muted-foreground">None found</p>
      ) : (
        <ResourceList resources={resources} canEdit={canEdit} />
      )}
    </section>
  )
}
