// @vitest-environment jsdom

import { cleanup, render } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import MeowChat from './meow-chat'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

test('keeps the focused mobile composer above the keyboard as it resizes', () => {
  vi.useFakeTimers()
  const viewport = Object.assign(new EventTarget(), {
    height: 400,
    offsetTop: 50,
    scale: 1,
  })
  const scrollBy = vi.fn()
  const mobile = { matches: true }
  vi.stubGlobal('visualViewport', viewport)
  vi.stubGlobal('matchMedia', () => mobile)
  vi.stubGlobal('scrollBy', scrollBy)

  const { getByRole, unmount } = render(<MeowChat />)
  const input = getByRole('textbox') as HTMLInputElement
  vi.spyOn(input.form!, 'getBoundingClientRect').mockReturnValue({
    bottom: 600,
  } as DOMRect)

  input.focus()
  vi.advanceTimersByTime(20)
  expect(scrollBy).toHaveBeenLastCalledWith({ top: 166, behavior: 'instant' })

  viewport.height = 300
  viewport.dispatchEvent(new Event('resize'))
  vi.advanceTimersByTime(20)
  expect(scrollBy).toHaveBeenLastCalledWith({ top: 266, behavior: 'instant' })

  scrollBy.mockClear()
  input.blur()
  viewport.dispatchEvent(new Event('resize'))
  vi.advanceTimersByTime(20)
  expect(scrollBy).not.toHaveBeenCalled()

  mobile.matches = false
  input.focus()
  vi.advanceTimersByTime(20)
  expect(scrollBy).not.toHaveBeenCalled()

  mobile.matches = true
  viewport.dispatchEvent(new Event('resize'))
  unmount()
  vi.advanceTimersByTime(20)
  expect(scrollBy).not.toHaveBeenCalled()
})
