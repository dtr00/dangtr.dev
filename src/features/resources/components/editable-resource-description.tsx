import { useMutation } from 'convex/react'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { FieldSaveError } from '#/components/ui/field-save-error'
import { Textarea } from '#/components/ui/textarea'
import { useConvexField } from '@/lib/use-convex-field'

type EditableResourceDescriptionProps = {
  resourceId: Id<'resources'>
  description: string
}

export default function EditableResourceDescription({
  resourceId,
  description,
}: EditableResourceDescriptionProps) {
  const updateDescription = useMutation(
    api.features.resources.mutations.updateDescription,
  )

  const { draft, setDraft, isSaving, saveError, save, revert } = useConvexField({
    value: description,
    prepare: (nextDescription) => nextDescription.trim(),
    onSave: async (trimmed) => {
      await updateDescription({ resourceId, description: trimmed })
    },
  })

  return (
    <div>
    <Textarea
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => {
        void save()
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          revert()
          event.currentTarget.blur()
        }
      }}
      disabled={isSaving}
      placeholder="Add description"
      aria-label="Resource description"
      rows={1}
      className="mt-1 field-sizing-content min-h-0 resize-none border-0 bg-transparent px-0 py-0 text-base leading-normal text-muted-foreground shadow-none focus-visible:border-transparent focus-visible:ring-0 md:text-base dark:bg-transparent"
    />
    <FieldSaveError message={saveError} />
    </div>
  )
}
