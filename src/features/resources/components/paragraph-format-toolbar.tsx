import { IconBold, IconItalic, IconUnderline } from '@tabler/icons-react'
import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'

import { Button } from '#/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'
import { cn } from '@/lib/utils'
import {
  DEFAULT_EDITOR_TEXT_COLOR,
  dispatchEditorInput,
  getCurrentTextColor,
  getEditorDefaultTextColor,
  getSelectionRect,
  restoreSelection,
  saveSelection,
} from '#/features/resources/lib/paragraph-selection-utils'

type ToolbarPosition = {
  top: number
  left: number
}

type ParagraphFormatToolbarProps = {
  editorRef: RefObject<HTMLDivElement | null>
  disabled?: boolean
}

const TEXT_COLORS = [
  { label: 'Red', value: '#ef4444' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Amber', value: '#eab308' },
  { label: 'Green', value: '#22c55e' },
  { label: 'Teal', value: '#14b8a6' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Violet', value: '#8b5cf6' },
  { label: 'Pink', value: '#ec4899' },
  { label: 'White', value: '#ffffff' },
] as const

export default function ParagraphFormatToolbar({
  editorRef,
  disabled = false,
}: ParagraphFormatToolbarProps) {
  const [position, setPosition] = useState<ToolbarPosition | null>(null)
  const [colorMenuOpen, setColorMenuOpen] = useState(false)
  const [currentTextColor, setCurrentTextColor] = useState(
    DEFAULT_EDITOR_TEXT_COLOR,
  )
  const savedRangeRef = useRef<Range | null>(null)
  const lastPositionRef = useRef<ToolbarPosition | null>(null)
  const colorMenuOpenRef = useRef(false)

  useEffect(() => {
    colorMenuOpenRef.current = colorMenuOpen
  }, [colorMenuOpen])

  useEffect(() => {
    function updatePosition() {
      const editor = editorRef.current

      if (!editor || disabled) {
        setPosition(null)
        lastPositionRef.current = null
        return
      }

      const rect = getSelectionRect(editor)

      if (!rect) {
        if (colorMenuOpenRef.current) {
          setPosition(lastPositionRef.current)
        } else {
          setPosition(null)
        }

        return
      }

      saveSelection(editor, savedRangeRef)
      setCurrentTextColor(getCurrentTextColor(editor, savedRangeRef))

      const nextPosition = {
        top: rect.top + window.scrollY - 52,
        left: rect.left + window.scrollX + rect.width / 2,
      }

      lastPositionRef.current = nextPosition
      setPosition(nextPosition)
    }

    document.addEventListener('selectionchange', updatePosition)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      document.removeEventListener('selectionchange', updatePosition)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [disabled, editorRef])

  function applyFormat(command: 'bold' | 'italic' | 'underline') {
    const editor = editorRef.current

    if (!editor || disabled) {
      return
    }

    restoreSelection(editor, savedRangeRef)
    document.execCommand(command, false)
    dispatchEditorInput(editor)
  }

  function applyTextColor(color: string) {
    const editor = editorRef.current

    if (!editor || disabled) {
      return
    }

    if (!restoreSelection(editor, savedRangeRef)) {
      return
    }

    document.execCommand('foreColor', false, color)
    dispatchEditorInput(editor)
    setCurrentTextColor(color)
    setColorMenuOpen(false)
  }

  function resetTextColor() {
    const editor = editorRef.current

    if (!editor || disabled) {
      return
    }

    if (!restoreSelection(editor, savedRangeRef)) {
      return
    }

    const defaultColor = getEditorDefaultTextColor(editor)
    document.execCommand('foreColor', false, defaultColor)
    dispatchEditorInput(editor)
    setCurrentTextColor(defaultColor)
    setColorMenuOpen(false)
  }

  if (!position) {
    return null
  }

  return (
    <div
      className="pointer-events-auto fixed z-50 flex -translate-x-1/2 items-center gap-0.5 rounded-md bg-popover p-0.5 shadow-md ring-1 ring-foreground/10"
      style={{ top: position.top, left: position.left }}
      onMouseDown={(event) => {
        event.preventDefault()
      }}
    >
      <Popover
        open={colorMenuOpen}
        onOpenChange={(open) => {
          const editor = editorRef.current

          if (open && editor) {
            saveSelection(editor, savedRangeRef)
          }

          setColorMenuOpen(open)
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Text color"
            disabled={disabled}
            className={cn('text-muted-foreground hover:text-foreground')}
          >
            <span
              className="size-4 rounded-full ring-1 ring-foreground/10"
              style={{ backgroundColor: currentTextColor }}
              aria-hidden
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="center"
          className="w-auto"
          onOpenAutoFocus={(event) => {
            event.preventDefault()
          }}
        >
          <div className="grid grid-cols-3 gap-1.5">
            {TEXT_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                aria-label={color.label}
                className="size-6 rounded-full ring-1 ring-foreground/10 transition-transform hover:scale-110"
                style={{ backgroundColor: color.value }}
                onMouseDown={(event) => {
                  event.preventDefault()
                }}
                onClick={() => {
                  applyTextColor(color.value)
                }}
              />
            ))}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="w-full text-muted-foreground"
            onMouseDown={(event) => {
              event.preventDefault()
            }}
            onClick={() => {
              resetTextColor()
            }}
          >
            Reset color
          </Button>
        </PopoverContent>
      </Popover>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Bold"
        disabled={disabled}
        className={cn('text-muted-foreground hover:text-foreground')}
        onClick={() => {
          applyFormat('bold')
        }}
      >
        <IconBold size={20} stroke={1.75} aria-hidden />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Italic"
        disabled={disabled}
        className={cn('text-muted-foreground hover:text-foreground')}
        onClick={() => {
          applyFormat('italic')
        }}
      >
        <IconItalic size={20} stroke={1.75} aria-hidden />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Underline"
        disabled={disabled}
        className={cn('text-muted-foreground hover:text-foreground')}
        onClick={() => {
          applyFormat('underline')
        }}
      >
        <IconUnderline size={20} stroke={1.75} aria-hidden />
      </Button>
    </div>
  )
}
