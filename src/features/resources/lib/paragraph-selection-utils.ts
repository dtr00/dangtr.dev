import type { RefObject } from 'react'

import { rgbStringToHex } from '#/features/resources/lib/rich-text-html'

export const DEFAULT_EDITOR_TEXT_COLOR = '#a3a3a3'

export function getSelectionRect(editor: HTMLDivElement): DOMRect | null {
  const selection = window.getSelection()

  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return null
  }

  const range = selection.getRangeAt(0)

  if (!editor.contains(range.commonAncestorContainer)) {
    return null
  }

  const rect = range.getBoundingClientRect()

  if (rect.width === 0 && rect.height === 0) {
    return null
  }

  return rect
}

export function saveSelection(
  editor: HTMLDivElement,
  savedRangeRef: RefObject<Range | null>,
) {
  const selection = window.getSelection()

  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    savedRangeRef.current = null
    return
  }

  const range = selection.getRangeAt(0)

  if (!editor.contains(range.commonAncestorContainer)) {
    savedRangeRef.current = null
    return
  }

  savedRangeRef.current = range.cloneRange()
}

export function restoreSelection(
  editor: HTMLDivElement,
  savedRangeRef: RefObject<Range | null>,
): boolean {
  const range = savedRangeRef.current
  const selection = window.getSelection()

  if (!range || !selection) {
    return false
  }

  editor.focus()
  selection.removeAllRanges()
  selection.addRange(range)

  return true
}

export function getEditorDefaultTextColor(editor: HTMLDivElement): string {
  return (
    rgbStringToHex(window.getComputedStyle(editor).color) ??
    DEFAULT_EDITOR_TEXT_COLOR
  )
}

export function dispatchEditorInput(editor: HTMLDivElement) {
  editor.dispatchEvent(new Event('input', { bubbles: true }))
}

function findExplicitColor(
  node: Node,
  editor: HTMLDivElement,
): string | null {
  let current: Node | null =
    node.nodeType === Node.TEXT_NODE ? node.parentElement : node

  while (current && current !== editor) {
    if (current instanceof HTMLSpanElement && current.style.color) {
      return rgbStringToHex(current.style.color)
    }

    if (current instanceof HTMLElement && current.tagName === 'FONT') {
      const fontColor = current.getAttribute('color')

      if (fontColor) {
        return rgbStringToHex(fontColor)
      }
    }

    current = current.parentElement
  }

  return null
}

export function getCurrentTextColor(
  editor: HTMLDivElement,
  savedRangeRef: RefObject<Range | null>,
): string {
  const range = savedRangeRef.current

  if (!range || range.collapsed) {
    return getEditorDefaultTextColor(editor)
  }

  const explicitColor = findExplicitColor(range.startContainer, editor)

  if (explicitColor) {
    return explicitColor
  }

  if (document.activeElement === editor) {
    const commandColor = rgbStringToHex(
      String(document.queryCommandValue('foreColor')),
    )

    if (commandColor && commandColor !== '#000000') {
      return commandColor
    }
  }

  let element: HTMLElement | null =
    range.startContainer.nodeType === Node.TEXT_NODE
      ? range.startContainer.parentElement
      : range.startContainer instanceof HTMLElement
        ? range.startContainer
        : null

  while (element && element !== editor) {
    const computedHex = rgbStringToHex(
      window.getComputedStyle(element).color,
    )
    const editorHex = rgbStringToHex(window.getComputedStyle(editor).color)

    if (computedHex && editorHex && computedHex !== editorHex) {
      return computedHex
    }

    element = element.parentElement
  }

  return getEditorDefaultTextColor(editor)
}
