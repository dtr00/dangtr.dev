import {
  IconAlignCenter,
  IconAlignLeft,
  IconAlignRight,
  IconTrash,
} from '@tabler/icons-react'
import type { ReactNode } from 'react'

import type { ResourceBlockAlignment } from '../../../../convex/features/resources/lib/blockTypes'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '#/components/ui/context-menu'

const alignmentOptions: Array<{
  value: ResourceBlockAlignment
  label: string
  icon: typeof IconAlignLeft
}> = [
  { value: 'left', label: 'Align left', icon: IconAlignLeft },
  { value: 'center', label: 'Align middle', icon: IconAlignCenter },
  { value: 'right', label: 'Align right', icon: IconAlignRight },
]

type ResourceBlockEditorProps = {
  align: ResourceBlockAlignment
  disabled: boolean
  onAlignChange: (align: ResourceBlockAlignment) => void
  onDelete: () => void
  children: ReactNode
}

export function ResourceBlockEditor({
  align,
  disabled,
  onAlignChange,
  onDelete,
  children,
}: ResourceBlockEditorProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="group relative -mx-2 px-2">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-y-1 inset-x-0 rounded-md group-hover:bg-accent group-data-[state=open]:bg-accent"
          />
          {children}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuSub>
          <ContextMenuSubTrigger>Align</ContextMenuSubTrigger>
          <ContextMenuSubContent
            align="start"
            sideOffset={2}
            collisionPadding={8}
          >
            <ContextMenuRadioGroup
              value={align}
              onValueChange={(nextAlign) => {
                const option = alignmentOptions.find(
                  (entry) => entry.value === nextAlign,
                )

                if (option) {
                  void onAlignChange(option.value)
                }
              }}
            >
              {alignmentOptions.map(({ value, label, icon: Icon }) => (
                <ContextMenuRadioItem
                  key={value}
                  value={value}
                  disabled={disabled}
                >
                  <Icon size={16} stroke={1.75} aria-hidden />
                  {label}
                </ContextMenuRadioItem>
              ))}
            </ContextMenuRadioGroup>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem
          variant="destructive"
          disabled={disabled}
          onSelect={() => {
            void onDelete()
          }}
        >
          <IconTrash size={16} stroke={1.75} aria-hidden />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
