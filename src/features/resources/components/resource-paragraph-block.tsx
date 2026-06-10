import { FieldSaveError } from '#/components/ui/field-save-error'
import { blockAlignmentClassName } from '#/features/resources/lib/block-alignment'
import { ResourceBlockEditor } from '#/features/resources/components/resource-block-editor'
import ParagraphRichTextEditor from '#/features/resources/components/paragraph-rich-text-editor'
import {
  isParagraphContentEmpty,
  sanitizeParagraphHtml,
  toParagraphDisplayHtml,
} from '../../../../convex/lib/richTextHtml'
import { useTextBlockEditor } from '#/features/resources/lib/use-text-block-editor'
import type { Id } from '../../../../convex/_generated/dataModel'
import type { ResourceBlockAlignment } from '../../../../convex/features/resources/lib/blockTypes'

type ResourceParagraphBlockProps = {
  blockId: Id<'resourceBlocks'>
  content: string
  align: ResourceBlockAlignment
  canEdit: boolean
}

type ResourceParagraphBlockContentProps = Omit<
  ResourceParagraphBlockProps,
  'canEdit'
>

export default function ResourceParagraphBlock({
  canEdit,
  ...contentProps
}: ResourceParagraphBlockProps) {
  if (!canEdit) {
    return <ResourceParagraphBlockReadOnly {...contentProps} />
  }

  return <ResourceParagraphBlockEditable {...contentProps} />
}

function ResourceParagraphBlockReadOnly({
  content,
  align,
}: Pick<ResourceParagraphBlockContentProps, 'content' | 'align'>) {
  if (isParagraphContentEmpty(content)) {
    return null
  }

  const alignmentClassName = blockAlignmentClassName(align)

  return (
    <div
      className={`text-base leading-normal text-muted-foreground [&_b]:font-semibold [&_i]:italic [&_strong]:font-semibold [&_u]:underline ${alignmentClassName}`}
      dangerouslySetInnerHTML={{ __html: toParagraphDisplayHtml(content) }}
    />
  )
}

function ResourceParagraphBlockEditable({
  blockId,
  content,
  align,
}: ResourceParagraphBlockContentProps) {
  const {
    value,
    setValue,
    saveError,
    isBusy,
    save,
    revert,
    handleDelete,
    handleAlignChange,
  } = useTextBlockEditor(blockId, content, align, {
    prepareContent: sanitizeParagraphHtml,
  })

  const alignmentClassName = blockAlignmentClassName(align)

  return (
    <ResourceBlockEditor
      align={align}
      disabled={isBusy}
      onAlignChange={handleAlignChange}
      onDelete={handleDelete}
    >
      <ParagraphRichTextEditor
        content={value}
        disabled={isBusy}
        placeholder="Paragraph"
        ariaLabel="Paragraph block"
        className={alignmentClassName}
        onChange={setValue}
        onBlur={(html) => {
          void save(html)
        }}
        onCancel={revert}
      />
      <FieldSaveError message={saveError} />
    </ResourceBlockEditor>
  )
}
