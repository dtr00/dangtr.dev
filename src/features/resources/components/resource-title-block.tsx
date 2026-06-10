import { FieldSaveError } from '#/components/ui/field-save-error'
import { Input } from '#/components/ui/input'
import { blockAlignmentClassName } from '#/features/resources/lib/block-alignment'
import { ResourceBlockEditor } from '#/features/resources/components/resource-block-editor'
import { useTextBlockEditor } from '#/features/resources/lib/use-text-block-editor'
import type { Id } from '../../../../convex/_generated/dataModel'
import type { ResourceBlockAlignment } from '../../../../convex/features/resources/lib/blockTypes'

const titleInputClassName =
  'relative z-10 h-auto min-h-0 w-full border-0 bg-transparent px-0 py-0 text-lg leading-[1.75rem] font-normal shadow-none focus-visible:border-transparent focus-visible:ring-0 md:text-lg dark:bg-transparent'

type ResourceTitleBlockProps = {
  blockId: Id<'resourceBlocks'>
  content: string
  align: ResourceBlockAlignment
  canEdit: boolean
}

type ResourceTitleBlockContentProps = Omit<ResourceTitleBlockProps, 'canEdit'>

export default function ResourceTitleBlock({
  canEdit,
  ...contentProps
}: ResourceTitleBlockProps) {
  if (!canEdit) {
    return <ResourceTitleBlockReadOnly {...contentProps} />
  }

  return <ResourceTitleBlockEditable {...contentProps} />
}

function ResourceTitleBlockReadOnly({
  content,
  align,
}: Pick<ResourceTitleBlockContentProps, 'content' | 'align'>) {
  if (!content) {
    return null
  }

  const alignmentClassName = blockAlignmentClassName(align)

  return (
    <h2 className={`text-lg leading-[1.75rem] text-foreground ${alignmentClassName}`}>
      {content}
    </h2>
  )
}

function ResourceTitleBlockEditable({
  blockId,
  content,
  align,
}: ResourceTitleBlockContentProps) {
  const {
    value,
    setValue,
    saveError,
    isBusy,
    save,
    revert,
    handleDelete,
    handleAlignChange,
  } = useTextBlockEditor(blockId, content, align)

  const alignmentClassName = blockAlignmentClassName(align)

  return (
    <ResourceBlockEditor
      align={align}
      disabled={isBusy}
      onAlignChange={handleAlignChange}
      onDelete={handleDelete}
    >
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={() => {
          void save(value)
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
        disabled={isBusy}
        placeholder="Title"
        aria-label="Title block"
        className={`${alignmentClassName} ${titleInputClassName}`}
      />
      <FieldSaveError message={saveError} />
    </ResourceBlockEditor>
  )
}
