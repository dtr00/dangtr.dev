import { useQuery } from '@tanstack/react-query'

import type { Id } from '../../../../convex/_generated/dataModel'
import AddResourceBlockButton from '#/features/resources/components/add-resource-block-button'
import {
  isBlockVisible,
  ResourceBlockView,
} from '#/features/resources/lib/block-registry'
import { resourceBlocksQuery } from '#/features/resources/lib/resource-page-query'
import type { ResourceBlockItem } from '#/features/resources/lib/resource-page-query'

type ResourceContentSectionProps = {
  resourceId: Id<'resources'>
  canEdit: boolean
  initialBlocks: ResourceBlockItem[]
}

function getVisibleBlocks(
  blocks: ResourceBlockItem[],
  canEdit: boolean,
): ResourceBlockItem[] {
  if (canEdit) {
    return blocks
  }

  return blocks.filter(isBlockVisible)
}

export default function ResourceContentSection({
  resourceId,
  canEdit,
  initialBlocks,
}: ResourceContentSectionProps) {
  const { data: blocks = initialBlocks } = useQuery({
    ...resourceBlocksQuery(resourceId),
    initialData: initialBlocks,
  })

  const visibleBlocks = getVisibleBlocks(blocks, canEdit)

  if (!canEdit && visibleBlocks.length === 0) {
    return null
  }

  return (
    <section className="mt-8">
      {visibleBlocks.length > 0 ? (
        <div className="flex flex-col gap-4">
          {visibleBlocks.map((block) => (
            <ResourceBlockView
              key={block._id}
              block={block}
              canEdit={canEdit}
            />
          ))}
        </div>
      ) : null}
      {canEdit ? (
        <div className={visibleBlocks.length > 0 ? 'mt-4' : undefined}>
          <AddResourceBlockButton resourceId={resourceId} />
        </div>
      ) : null}
    </section>
  )
}
