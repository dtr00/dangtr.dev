import {
  IconLink,
  IconPhoto,
  IconPilcrow,
  IconPlus,
  IconTextSize,
} from '@tabler/icons-react'
import { useMutation } from 'convex/react'
import { useState } from 'react'

import { api } from '../../../../convex/_generated/api'
import type { ResourceBlockType } from '../../../../convex/features/resources/lib/blockTypes'
import type { Id } from '../../../../convex/_generated/dataModel'
import { Button } from '#/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'

type AddResourceBlockButtonProps = {
  resourceId: Id<'resources'>
}

const blockOptions: Array<{
  type: ResourceBlockType
  label: string
  icon: typeof IconTextSize
}> = [
  { type: 'title', label: 'Title', icon: IconTextSize },
  { type: 'paragraph', label: 'Paragraph', icon: IconPilcrow },
  { type: 'image', label: 'Image', icon: IconPhoto },
  { type: 'link', label: 'Link', icon: IconLink },
]

export default function AddResourceBlockButton({
  resourceId,
}: AddResourceBlockButtonProps) {
  const createBlock = useMutation(api.features.resources.blocks.mutations.create)
  const [open, setOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  async function handleAddBlock(type: ResourceBlockType) {
    setIsAdding(true)

    try {
      await createBlock({ resourceId, type })
      setOpen(false)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Add block"
          className="text-muted-foreground hover:text-foreground"
        >
          <IconPlus size={16} stroke={1.75} aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="right" align="start" className="w-48">
        {blockOptions.map(({ type, label, icon: Icon }) => (
          <Button
            key={type}
            type="button"
            variant="ghost"
            size="sm"
            disabled={isAdding}
            className="w-full justify-start font-normal text-foreground hover:text-foreground"
            onClick={() => {
              void handleAddBlock(type)
            }}
          >
            <Icon
              size={16}
              stroke={1.75}
              aria-hidden
              className="text-muted-foreground transition-colors group-hover/button:text-foreground"
            />
            {label}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
