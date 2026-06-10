import { useMutation } from 'convex/react'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { FieldSaveError } from '#/components/ui/field-save-error'
import { Input } from '#/components/ui/input'
import { useConvexField } from '@/lib/use-convex-field'

type EditableResourceNameProps = {
  resourceId: Id<'resources'>
  name: string
}

export default function EditableResourceName({
  resourceId,
  name,
}: EditableResourceNameProps) {
  const updateName = useMutation(api.features.resources.mutations.updateName)

  const { draft, setDraft, isSaving, saveError, save, revert } = useConvexField({
    value: name,
    prepare: (nextName) => nextName.trim(),
    onSave: async (trimmed) => {
      if (trimmed.length === 0) {
        throw new Error('Resource name is required')
      }

      await updateName({ resourceId, name: trimmed })
    },
  })

  return (
    <div>
    <Input
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => {
        const trimmed = draft.trim()

        if (trimmed.length === 0) {
          revert()
          return
        }

        void save()
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.currentTarget.blur()
        }

        if (event.key === 'Escape') {
          revert()
          event.currentTarget.blur()
        }
      }}
      disabled={isSaving}
      aria-label="Resource name"
      className="h-auto border-0 bg-transparent px-0 py-0 text-lg leading-normal font-normal shadow-none focus-visible:border-transparent focus-visible:ring-0 md:text-lg dark:bg-transparent"
    />
    <FieldSaveError message={saveError} />
    </div>
  )
}
