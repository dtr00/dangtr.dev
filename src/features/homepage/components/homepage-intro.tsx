import { useMutation } from 'convex/react'
import { useQuery } from '@tanstack/react-query'

import { api } from '../../../../convex/_generated/api'
import { FieldSaveError } from '#/components/ui/field-save-error'
import ParagraphRichTextEditor from '#/features/resources/components/paragraph-rich-text-editor'
import { useCanEdit } from '#/features/auth/lib/use-can-edit'
import { homepageIntroQuery } from '#/features/homepage/lib/homepage-intro-query'
import {
  isHomepageContentEmpty,
  sanitizeHomepageHtml,
  toHomepageDisplayHtml,
} from '../../../../convex/lib/richTextHtml'
import { useConvexField } from '@/lib/use-convex-field'

const homepageIntroClassName =
  'text-base leading-normal outline-none [&_b]:font-semibold [&_i]:italic [&_strong]:font-semibold [&_u]:underline [&_p:first-child]:text-foreground [&_p:not(:first-child)]:text-muted-foreground [&_p+_p]:mt-4 [&_p:first-child+_p]:mt-0 [&_p:nth-child(3)]:mt-6'

type HomepageIntroProps = {
  initialContent: string
}

export default function HomepageIntro({ initialContent }: HomepageIntroProps) {
  const canEdit = useCanEdit()
  const { data: content = initialContent } = useQuery({
    ...homepageIntroQuery,
    initialData: initialContent,
  })
  const updateIntro = useMutation(api.features.homepage.mutations.updateIntro)

  const { draft, setDraft, isSaving, saveError, save, revert } = useConvexField({
    value: content,
    prepare: sanitizeHomepageHtml,
    onSave: async (prepared) => {
      if (isHomepageContentEmpty(prepared)) {
        throw new Error('Homepage introduction cannot be empty')
      }

      await updateIntro({ content: prepared })
    },
  })

  if (!canEdit) {
    return (
      <div
        className={homepageIntroClassName}
        dangerouslySetInnerHTML={{ __html: toHomepageDisplayHtml(content) }}
      />
    )
  }

  return (
    <div>
    <ParagraphRichTextEditor
      content={draft}
      disabled={isSaving}
      placeholder="Write your introduction…"
      ariaLabel="Homepage introduction"
      className={homepageIntroClassName}
      toDisplayHtml={toHomepageDisplayHtml}
      isContentEmpty={isHomepageContentEmpty}
      onChange={setDraft}
      onBlur={(html) => {
        if (isHomepageContentEmpty(html)) {
          revert()
          return
        }

        void save(html)
      }}
      onCancel={revert}
    />
    <FieldSaveError message={saveError} />
    </div>
  )
}
