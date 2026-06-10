import { useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { IconPhoto, IconUpload } from '@tabler/icons-react'

import type { Id } from '../../../../convex/_generated/dataModel'
import type { ResourceBlockAlignment } from '../../../../convex/features/resources/lib/blockTypes'
import { parseImageBlockContent } from '../../../../convex/features/resources/lib/imageContent'
import { FieldSaveError } from '#/components/ui/field-save-error'
import { Input } from '#/components/ui/input'
import { Spinner } from '#/components/ui/spinner'
import { ResourceBlockEditor } from '#/features/resources/components/resource-block-editor'
import {
  blockAlignmentClassName,
  imageFigureAlignClassName,
} from '#/features/resources/lib/block-alignment'
import {
  clampImageWidth,
  imageClassName,
  widthStyle,
} from '#/features/resources/lib/image-block-layout'
import { useImageBlockMetadata } from '#/features/resources/lib/use-image-block-metadata'
import { useImageBlockUpload } from '#/features/resources/lib/use-image-block-upload'

type ResourceImageBlockProps = {
  blockId: Id<'resourceBlocks'>
  content: string
  align: ResourceBlockAlignment
  imageUrl?: string | null
  alt?: string
  canEdit: boolean
}

type ResourceImageBlockContentProps = Omit<ResourceImageBlockProps, 'canEdit'>

export default function ResourceImageBlock({
  canEdit,
  ...contentProps
}: ResourceImageBlockProps) {
  if (!canEdit) {
    return <ResourceImageBlockReadOnly {...contentProps} />
  }

  return <ResourceImageBlockEditable {...contentProps} />
}

function ResourceImageBlockReadOnly({
  content,
  imageUrl,
  alt,
  align,
}: Pick<
  ResourceImageBlockContentProps,
  'content' | 'imageUrl' | 'alt' | 'align'
>) {
  if (!imageUrl) {
    return null
  }

  const caption = alt?.trim()
  const { width } = parseImageBlockContent(content)

  return (
    <div className="w-full">
      <figure
        className={`grid w-max max-w-full gap-1.5 ${blockAlignmentClassName(align)} ${imageFigureAlignClassName(align)}`}
        style={widthStyle(width)}
      >
        <img
          src={imageUrl}
          alt={caption ?? ''}
          className={`block ${imageClassName(width)}`}
          style={widthStyle(width)}
          loading="lazy"
          decoding="async"
        />
        {caption ? (
          <figcaption className="min-w-0 text-sm text-muted-foreground">
            {caption}
          </figcaption>
        ) : null}
      </figure>
    </div>
  )
}

function ResourceImageBlockEditable({
  blockId,
  content,
  align,
  imageUrl,
  alt = '',
}: ResourceImageBlockContentProps) {
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const parsedContent = parseImageBlockContent(content)

  const {
    alt: altValue,
    width: imageWidth,
    setAlt,
    setWidth,
    saveError,
    isBusy,
    save,
    revert,
    handleDelete,
    handleAlignChange,
  } = useImageBlockMetadata(blockId, content, align)

  const {
    fileInputRef,
    isUploading,
    uploadError,
    isDragActive,
    setIsDragActive,
    handleFileSelection,
    openFilePicker,
  } = useImageBlockUpload(blockId)

  const alignmentClassName = blockAlignmentClassName(align)
  const figureAlignClassName = imageFigureAlignClassName(align)
  const disabled = isBusy || isUploading

  function handleResizePointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (disabled) {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    const handle = event.currentTarget
    const imageElement = handle.parentElement?.querySelector('img')

    if (!imageElement) {
      return
    }

    const startX = event.clientX
    const startWidth = imageElement.offsetWidth
    const maxWidth = imageContainerRef.current?.clientWidth ?? startWidth
    let lastWidth =
      imageWidth ?? clampImageWidth(startWidth, 0, maxWidth)

    handle.setPointerCapture(event.pointerId)

    function handlePointerMove(ev: globalThis.PointerEvent) {
      lastWidth = clampImageWidth(startWidth, ev.clientX - startX, maxWidth)
      setWidth(lastWidth)
    }

    function handlePointerUp() {
      handle.releasePointerCapture(event.pointerId)
      handle.removeEventListener('pointermove', handlePointerMove)
      handle.removeEventListener('pointerup', handlePointerUp)
      void save({ alt: altValue, width: lastWidth })
    }

    handle.addEventListener('pointermove', handlePointerMove)
    handle.addEventListener('pointerup', handlePointerUp)
  }

  return (
    <ResourceBlockEditor
      align={align}
      disabled={disabled}
      onAlignChange={handleAlignChange}
      onDelete={handleDelete}
    >
      <div className="relative z-10 flex flex-col gap-3">
        {imageUrl ? (
          <div ref={imageContainerRef} className="w-full">
            <figure
              className={`grid w-max max-w-full gap-1.5 ${alignmentClassName} ${figureAlignClassName}`}
              style={widthStyle(imageWidth)}
            >
              <div className="group/image relative w-max max-w-full">
                <img
                  src={imageUrl}
                  alt={altValue || alt}
                  className={`block ${imageClassName(imageWidth)}`}
                  style={widthStyle(imageWidth)}
                  loading="lazy"
                  decoding="async"
                />
                <button
                  type="button"
                  disabled={disabled}
                  onClick={openFilePicker}
                  className={`absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-md bg-background/70 px-1 text-center text-xs text-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-60 ${
                    isUploading
                      ? 'opacity-100'
                      : 'opacity-0 group-hover/image:opacity-100 group-focus-within/image:opacity-100'
                  }`}
                >
                  {isUploading ? (
                    <Spinner className="size-4" />
                  ) : (
                    <IconPhoto size={14} stroke={1.75} aria-hidden />
                  )}
                  <span>{isUploading ? 'Processing…' : 'Replace'}</span>
                </button>
                <button
                  type="button"
                  aria-label="Resize image"
                  onPointerDown={handleResizePointerDown}
                  className="absolute right-0 bottom-0 z-10 size-4 translate-x-1/4 translate-y-1/4 cursor-se-resize rounded-sm border border-foreground/20 bg-background opacity-0 transition-opacity group-hover/image:opacity-100"
                />
              </div>
              {parsedContent.storageId ? (
                <Input
                  value={altValue}
                  onChange={(event) => {
                    setAlt(event.target.value)
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
                  disabled={disabled}
                  placeholder="Alt text (optional)"
                  aria-label="Image alt text"
                  className="relative z-10 col-start-1 h-auto min-h-0 w-full min-w-0 border-0 bg-transparent px-0 py-0 text-sm text-muted-foreground shadow-none placeholder:text-muted-foreground focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent"
                />
              ) : null}
            </figure>
          </div>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={openFilePicker}
            onDragEnter={(event) => {
              event.preventDefault()
              setIsDragActive(true)
            }}
            onDragOver={(event) => {
              event.preventDefault()
              setIsDragActive(true)
            }}
            onDragLeave={(event) => {
              event.preventDefault()
              setIsDragActive(false)
            }}
            onDrop={(event) => {
              event.preventDefault()
              setIsDragActive(false)
              handleFileSelection(event.dataTransfer.files)
            }}
            className={`flex min-h-36 w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed px-4 py-6 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60 ${
              isDragActive ? 'border-foreground/40 bg-accent/40' : 'border-border'
            }`}
          >
            {isUploading ? (
              <Spinner className="size-5" />
            ) : (
              <IconUpload size={20} stroke={1.75} aria-hidden />
            )}
            <span>{isUploading ? 'Processing image…' : 'Upload image'}</span>
            <span className="text-xs">JPEG, PNG, WebP, GIF, or AVIF up to 10 MB</span>
          </button>
        )}

        <FieldSaveError message={saveError ?? uploadError} />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          className="hidden"
          onChange={(event) => {
            handleFileSelection(event.target.files)
            event.target.value = ''
          }}
        />
      </div>
    </ResourceBlockEditor>
  )
}
