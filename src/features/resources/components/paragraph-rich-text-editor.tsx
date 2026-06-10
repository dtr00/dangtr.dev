import { useEffect, useLayoutEffect, useRef } from 'react'

import { cn } from '@/lib/utils'
import ParagraphFormatToolbar from '#/features/resources/components/paragraph-format-toolbar'
import {
  isParagraphContentEmpty,
  toParagraphDisplayHtml,
} from '../../../../convex/lib/richTextHtml'

const paragraphEditorClassName =
  'relative z-10 min-h-[1.5rem] w-full text-base leading-normal text-muted-foreground outline-none [&_b]:font-semibold [&_i]:italic [&_strong]:font-semibold [&_u]:underline [&[data-empty=true]]:before:pointer-events-none [&[data-empty=true]]:before:text-muted-foreground [&[data-empty=true]]:before:content-[attr(data-placeholder)]'

function syncEditorEmptyState(
  editor: HTMLDivElement,
  isContentEmpty: (content: string) => boolean,
) {
  if (isContentEmpty(editor.innerHTML)) {
    editor.dataset.empty = 'true'
    return
  }

  delete editor.dataset.empty
}

type ParagraphRichTextEditorProps = {
  content: string
  disabled?: boolean
  placeholder?: string
  className?: string
  ariaLabel: string
  toDisplayHtml?: (content: string) => string
  isContentEmpty?: (content: string) => boolean
  onChange: (html: string) => void
  onBlur: (html: string) => void
  onCancel: () => void
}

export default function ParagraphRichTextEditor({
  content,
  disabled = false,
  placeholder = 'Paragraph',
  className,
  ariaLabel,
  toDisplayHtml = toParagraphDisplayHtml,
  isContentEmpty = isParagraphContentEmpty,
  onChange,
  onBlur,
  onCancel,
}: ParagraphRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const lastSyncedContent = useRef<string | null>(null)
  const skipNextBlurRef = useRef(false)

  useLayoutEffect(() => {
    const editor = editorRef.current

    if (!editor) {
      return
    }

    const nextHtml = toDisplayHtml(content)

    if (editor.innerHTML === nextHtml) {
      if (isContentEmpty(editor.innerHTML)) {
        editor.innerHTML = ''
      }

      syncEditorEmptyState(editor, isContentEmpty)
      lastSyncedContent.current = editor.innerHTML
      return
    }

    if (document.activeElement === editor) {
      return
    }

    editor.innerHTML = nextHtml

    if (isContentEmpty(editor.innerHTML)) {
      editor.innerHTML = ''
    }

    syncEditorEmptyState(editor, isContentEmpty)
    lastSyncedContent.current = editor.innerHTML
  }, [content, isContentEmpty, toDisplayHtml])

  useEffect(() => {
    if (disabled) {
      window.getSelection()?.removeAllRanges()
    }
  }, [disabled])

  return (
    <>
      <ParagraphFormatToolbar editorRef={editorRef} disabled={disabled} />
      <div
        ref={editorRef}
        role="textbox"
        aria-multiline="true"
        aria-label={ariaLabel}
        contentEditable={!disabled}
        suppressContentEditableWarning
        data-placeholder={placeholder}
        className={cn(paragraphEditorClassName, className)}
        onInput={() => {
          const editor = editorRef.current

          if (!editor) {
            return
          }

          syncEditorEmptyState(editor, isContentEmpty)
          lastSyncedContent.current = editor.innerHTML
        }}
        onBlur={() => {
          if (skipNextBlurRef.current) {
            skipNextBlurRef.current = false
            return
          }

          const editor = editorRef.current

          if (!editor) {
            return
          }

          let html = editor.innerHTML

          if (isContentEmpty(html)) {
            html = ''
            editor.innerHTML = ''
            syncEditorEmptyState(editor, isContentEmpty)
          }

          lastSyncedContent.current = html
          onChange(html)
          onBlur(html)
        }}
        onKeyDown={(event) => {
          if (disabled) {
            return
          }

          if (event.key === 'Escape') {
            event.preventDefault()
            skipNextBlurRef.current = true
            onCancel()
            event.currentTarget.blur()
            return
          }

          if (!(event.metaKey || event.ctrlKey)) {
            return
          }

          if (event.key === 'b') {
            event.preventDefault()
            document.execCommand('bold', false)
            editorRef.current?.dispatchEvent(new Event('input', { bubbles: true }))
          }

          if (event.key === 'i') {
            event.preventDefault()
            document.execCommand('italic', false)
            editorRef.current?.dispatchEvent(new Event('input', { bubbles: true }))
          }

          if (event.key === 'u') {
            event.preventDefault()
            document.execCommand('underline', false)
            editorRef.current?.dispatchEvent(new Event('input', { bubbles: true }))
          }
        }}
      />
    </>
  )
}
