import { useMutation } from 'convex/react'
import { useState } from 'react'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import type { ResourceBlockAlignment } from '../../../../convex/features/resources/lib/blockTypes'
import { getSaveErrorMessage } from '@/lib/save-error-message'

export function useResourceBlockChrome(
  blockId: Id<'resourceBlocks'>,
  align: ResourceBlockAlignment,
) {
  const updateAlign = useMutation(
    api.features.resources.blocks.mutations.updateAlign,
  )
  const removeBlock = useMutation(api.features.resources.blocks.mutations.remove)
  const [isDeleting, setIsDeleting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  async function handleDelete() {
    if (isDeleting) {
      return
    }

    setIsDeleting(true)
    setActionError(null)

    try {
      await removeBlock({ blockId })
    } catch (error) {
      setActionError(getSaveErrorMessage(error))
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleAlignChange(nextAlign: ResourceBlockAlignment) {
    if (isDeleting || nextAlign === align) {
      return
    }

    setActionError(null)

    try {
      await updateAlign({ blockId, align: nextAlign })
    } catch (error) {
      setActionError(getSaveErrorMessage(error))
    }
  }

  return {
    isDeleting,
    actionError,
    handleDelete,
    handleAlignChange,
  }
}
