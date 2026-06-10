import { useMutation } from 'convex/react'
import { useState } from 'react'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import IconSelect from '#/features/resources/components/icon-select'
import {
  DEFAULT_RESOURCE_ICON,
  toResourceIconName,
  type ResourceIconName,
} from '#/features/resources/lib/resource-icons'

type EditableResourceIconProps = {
  resourceId: Id<'resources'>
  icon: string
}

export default function EditableResourceIcon({
  resourceId,
  icon,
}: EditableResourceIconProps) {
  const updateIcon = useMutation(api.features.resources.mutations.updateIcon)
  const [isSaving, setIsSaving] = useState(false)
  const iconName: ResourceIconName =
    toResourceIconName(icon) ?? DEFAULT_RESOURCE_ICON

  async function handleChange(nextIcon: ResourceIconName) {
    if (nextIcon === iconName) {
      return
    }

    setIsSaving(true)

    try {
      await updateIcon({ resourceId, icon: nextIcon })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <IconSelect
      value={iconName}
      onChange={(nextIcon) => {
        void handleChange(nextIcon)
      }}
      disabled={isSaving}
      triggerVariant="ghost"
      iconSize={20}
    />
  )
}
