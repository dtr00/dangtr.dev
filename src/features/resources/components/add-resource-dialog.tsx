import { useMutation } from 'convex/react'
import { useState, type FormEvent } from 'react'

import { api } from '../../../../convex/_generated/api'
import { getSaveErrorMessage } from '@/lib/save-error-message'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import IconSelect from '#/features/resources/components/icon-select'
import { Spinner } from '#/components/ui/spinner'
import { Textarea } from '#/components/ui/textarea'
import {
  DEFAULT_RESOURCE_ICON,
  type ResourceIconName,
} from '#/features/resources/lib/resource-icons'

const DEFAULT_RESOURCE_NAME = 'Untitled resource'

export default function AddResourceDialog() {
  const createResource = useMutation(api.features.resources.mutations.create)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(DEFAULT_RESOURCE_NAME)
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState<ResourceIconName>(DEFAULT_RESOURCE_ICON)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function resetForm() {
    setName(DEFAULT_RESOURCE_NAME)
    setDescription('')
    setIcon(DEFAULT_RESOURCE_ICON)
    setError(null)
    setIsSubmitting(false)
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)

    if (!nextOpen) {
      resetForm()
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!name.trim()) {
      setError('Resource name is required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await createResource({
        name: name.trim(),
        description: description.trim(),
        icon,
      })
      setOpen(false)
      resetForm()
    } catch (submitError) {
      setError(getSaveErrorMessage(submitError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm">
          + Add resource
        </Button>
      </DialogTrigger>
      <DialogContent
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          const input = document.getElementById('resource-name')
          if (input instanceof HTMLInputElement) {
            input.focus()
            input.select()
          }
        }}
      >
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <DialogHeader className="flex-row items-center gap-2">
            <IconSelect
              value={icon}
              onChange={setIcon}
              disabled={isSubmitting}
            />
            <DialogTitle>Add resource</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <Input
              id="resource-name"
              name="resourceName"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Resource name"
              aria-label="Resource name"
              disabled={isSubmitting}
              className="h-auto border-0 bg-transparent px-0 shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent"
            />
            <Textarea
              id="resource-description"
              name="resourceDescription"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Description"
              aria-label="Description"
              disabled={isSubmitting}
              className="field-sizing-fixed h-16 resize-none border-0 bg-transparent px-0 py-0 shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent"
            />
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner />
                  Adding resource
                </>
              ) : (
                'Add resource'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
