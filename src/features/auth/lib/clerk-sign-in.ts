import type { SignInModalProps } from '@clerk/shared/types'

import { clerkAppearance } from '#/features/auth/lib/clerk-appearance'

export const signInModalProps = {
  withSignUp: false,
  appearance: clerkAppearance,
} satisfies SignInModalProps
