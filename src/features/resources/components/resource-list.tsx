import { IconTrash } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { useState } from 'react'

import { api } from '../../../../convex/_generated/api'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog'
import { Button } from '#/components/ui/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '#/components/ui/item'
import { FieldSaveError } from '#/components/ui/field-save-error'
import { Spinner } from '#/components/ui/spinner'
import { getSaveErrorMessage } from '@/lib/save-error-message'
import { ResourceIcon } from '#/features/resources/lib/resource-icons'
import type { ResourceListItem } from '#/features/resources/lib/resources-query'

function ResourceItemDeleteButton({
  resource,
  open,
  isDeleting,
  onOpenChange,
  onConfirmDelete,
}: {
  resource: ResourceListItem
  open: boolean
  isDeleting: boolean
  onOpenChange: (open: boolean) => void
  onConfirmDelete: () => void
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Delete ${resource.name}`}
        >
          <IconTrash size={14} stroke={1.75} aria-hidden />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete resource?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete &ldquo;{resource.name}&rdquo;. This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isDeleting}
            onClick={(event) => {
              event.preventDefault()
              onConfirmDelete()
            }}
          >
            {isDeleting ? (
              <>
                <Spinner />
                Deleting
              </>
            ) : (
              'Delete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function ResourceItem({
  resource,
  canEdit,
}: {
  resource: ResourceListItem
  canEdit: boolean
}) {
  const removeResource = useMutation(api.features.resources.mutations.remove)
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)

    if (!nextOpen) {
      setIsDeleting(false)
    }
  }

  async function handleConfirmDelete() {
    setIsDeleting(true)
    setDeleteError(null)

    try {
      await removeResource({ resourceId: resource._id })
      setOpen(false)
    } catch (error) {
      setDeleteError(getSaveErrorMessage(error))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Item variant="default" size="sm" className="p-0">
      <Link
        to="/resources/$resourceId"
        params={{ resourceId: resource._id }}
        className="group flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-foreground no-underline"
      >
        <ItemMedia variant="icon" className="text-muted-foreground">
          <ResourceIcon name={resource.icon} />
        </ItemMedia>
        <ItemContent className="min-w-0">
          <ItemTitle className="inline-block w-fit max-w-full truncate border-b border-transparent pb-px group-hover:border-current line-clamp-none">
            {resource.name}
          </ItemTitle>
          {resource.description ? (
            <ItemDescription>{resource.description}</ItemDescription>
          ) : null}
        </ItemContent>
      </Link>
      {canEdit ? (
        <ItemActions className="flex-col items-end">
          <ResourceItemDeleteButton
            resource={resource}
            open={open}
            isDeleting={isDeleting}
            onOpenChange={handleOpenChange}
            onConfirmDelete={() => {
              void handleConfirmDelete()
            }}
          />
          <FieldSaveError message={deleteError} />
        </ItemActions>
      ) : null}
    </Item>
  )
}

type ResourceListProps = {
  resources: ResourceListItem[]
  canEdit: boolean
}

export default function ResourceList({ resources, canEdit }: ResourceListProps) {
  return (
    <ItemGroup className="mt-4 gap-2">
      {resources.map((resource) => (
        <ResourceItem
          key={resource._id}
          resource={resource}
          canEdit={canEdit}
        />
      ))}
    </ItemGroup>
  )
}
