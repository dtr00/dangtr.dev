import { IconArrowUpRight } from '@tabler/icons-react'

import type { Id } from '../../../../convex/_generated/dataModel'
import type { ResourceBlockAlignment } from '../../../../convex/features/resources/lib/blockTypes'
import { FieldSaveError } from '#/components/ui/field-save-error'
import { Input } from '#/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/components/ui/tooltip'
import { blockAlignmentClassName } from '#/features/resources/lib/block-alignment'
import { ResourceBlockEditor } from '#/features/resources/components/resource-block-editor'
import {
  normalizeLinkUrl,
  parseLinkBlockContent,
} from '../../../../convex/features/resources/lib/linkContent'
import { useLinkBlockEditor } from '#/features/resources/lib/use-link-block-editor'

const linkLabelInputClassName =
  'relative z-10 h-auto min-h-0 w-full rounded-none border-0 bg-transparent px-0 py-0 text-base shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent'

const linkUrlInputClassName =
  'relative z-10 h-auto min-h-0 w-full rounded-none border-0 bg-transparent px-0 py-0 text-sm shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent'

const linkAnchorClassName =
  'group inline-flex items-center gap-1 text-base text-foreground'

const linkArrowClassName =
  'text-muted-foreground transition-colors group-hover:text-foreground'

const linkArrowSize = 16

type ResourceLinkBlockProps = {
  blockId: Id<'resourceBlocks'>
  content: string
  align: ResourceBlockAlignment
  canEdit: boolean
}

type ResourceLinkBlockContentProps = Omit<ResourceLinkBlockProps, 'canEdit'>

function ResourceLinkAnchor({
  href,
  children,
}: {
  href: string
  children: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkAnchorClassName}
        >
          {children}
          <IconArrowUpRight
            className={linkArrowClassName}
            size={linkArrowSize}
            stroke={1.75}
            aria-hidden
          />
        </a>
      </TooltipTrigger>
      <TooltipContent sideOffset={4} className="w-fit max-w-none">
        <span className="inline-flex items-center whitespace-nowrap">
          <span className="shrink-0">Open</span>
          <span className="max-w-56 truncate pl-1 text-muted-foreground">
            {href}
          </span>
        </span>
      </TooltipContent>
    </Tooltip>
  )
}

export default function ResourceLinkBlock({
  canEdit,
  ...contentProps
}: ResourceLinkBlockProps) {
  if (!canEdit) {
    return <ResourceLinkBlockReadOnly {...contentProps} />
  }

  return <ResourceLinkBlockEditable {...contentProps} />
}

function ResourceLinkBlockReadOnly({
  content,
  align,
}: Pick<ResourceLinkBlockContentProps, 'content' | 'align'>) {
  const { label, url } = parseLinkBlockContent(content)
  const displayLabel = label.trim() || url.trim()

  if (!displayLabel) {
    return null
  }

  const normalizedUrl = normalizeLinkUrl(url)
  const alignmentClassName = blockAlignmentClassName(align)

  if (normalizedUrl) {
    return (
      <div className={alignmentClassName}>
        <ResourceLinkAnchor href={normalizedUrl}>{displayLabel}</ResourceLinkAnchor>
      </div>
    )
  }

  return (
    <p className={`text-base text-muted-foreground ${alignmentClassName}`}>
      {displayLabel}
    </p>
  )
}

function ResourceLinkBlockEditable({
  blockId,
  content,
  align,
}: ResourceLinkBlockContentProps) {
  const {
    label,
    url,
    setLabel,
    setUrl,
    saveError,
    isBusy,
    save,
    revert,
    handleDelete,
    handleAlignChange,
  } = useLinkBlockEditor(blockId, content, align)

  const normalizedUrl = normalizeLinkUrl(url)
  const alignmentClassName = blockAlignmentClassName(align)

  return (
    <ResourceBlockEditor
      align={align}
      disabled={isBusy}
      onAlignChange={handleAlignChange}
      onDelete={handleDelete}
    >
      <div className={`flex w-full flex-col gap-1 ${alignmentClassName}`}>
        <div
          className={`flex w-full items-center gap-1 ${normalizedUrl ? linkAnchorClassName : ''}`}
        >
          <Input
            value={label}
            onChange={(event) => {
              setLabel(event.target.value)
            }}
            onBlur={() => {
              void save()
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                revert()
                event.currentTarget.blur()
              }
            }}
            disabled={isBusy}
            placeholder="Link text"
            aria-label="Link text"
            className={`min-w-0 flex-1 ${normalizedUrl ? 'font-normal text-foreground' : 'text-foreground'} ${linkLabelInputClassName}`}
          />
          {normalizedUrl ? (
            <IconArrowUpRight
              className={`shrink-0 ${linkArrowClassName}`}
              size={linkArrowSize}
              stroke={1.75}
              aria-hidden
            />
          ) : null}
        </div>
        <Input
          value={url}
          onChange={(event) => {
            setUrl(event.target.value)
          }}
          onBlur={() => {
            void save()
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              revert()
              event.currentTarget.blur()
            }
          }}
          disabled={isBusy}
          placeholder="https://example.com"
          aria-label="Link URL"
          className={`text-muted-foreground placeholder:text-muted-foreground ${linkUrlInputClassName}`}
        />
        <FieldSaveError message={saveError} />
      </div>
    </ResourceBlockEditor>
  )
}
