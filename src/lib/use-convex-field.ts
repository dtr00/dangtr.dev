import { useEffect, useState } from 'react'

import { getSaveErrorMessage } from '@/lib/save-error-message'

type UseConvexFieldOptions<T> = {
  value: T
  prepare?: (value: T) => T
  isEqual?: (current: T, next: T) => boolean
  onSave: (value: T) => Promise<void>
}

export function useConvexField<T>({
  value,
  prepare,
  isEqual,
  onSave,
}: UseConvexFieldOptions<T>) {
  const [draft, setDraft] = useState(value)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    setDraft(value)
    setSaveError(null)
  }, [value])

  function normalize(nextValue: T): T {
    return prepare ? prepare(nextValue) : nextValue
  }

  function valuesMatch(current: T, next: T): boolean {
    if (isEqual) {
      return isEqual(current, next)
    }

    return current === next
  }

  async function save(nextValue: T = draft) {
    const prepared = normalize(nextValue)
    const normalizedCurrent = normalize(value)

    if (valuesMatch(normalizedCurrent, prepared)) {
      setSaveError(null)
      return
    }

    setIsSaving(true)
    setSaveError(null)

    try {
      await onSave(prepared)
    } catch (error) {
      setDraft(value)
      setSaveError(getSaveErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  function revert() {
    setDraft(value)
    setSaveError(null)
  }

  return {
    draft,
    setDraft,
    isSaving,
    saveError,
    save,
    revert,
  }
}
