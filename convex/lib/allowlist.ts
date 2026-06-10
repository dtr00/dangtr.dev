import type { UserIdentity } from 'convex/server'

type AllowedIdentifiers = {
  userId: string | undefined
  email: string | undefined
  githubUsername: string | undefined
}

function getAllowedIdentifiers(): AllowedIdentifiers {
  return {
    userId: process.env.ALLOWED_CLERK_USER_ID,
    email: process.env.ALLOWED_USER_EMAIL?.toLowerCase(),
    githubUsername: process.env.ALLOWED_GITHUB_USERNAME?.toLowerCase(),
  }
}

export function isAllowlistConfigured(): boolean {
  const { userId, email, githubUsername } = getAllowedIdentifiers()
  return Boolean(userId ?? email ?? githubUsername)
}

function getIdentityStringField(
  identity: UserIdentity,
  field: string,
): string | undefined {
  const value = identity[field]
  return typeof value === 'string' ? value : undefined
}

function matchesGithubUsername(
  identity: UserIdentity,
  githubUsername: string,
): boolean {
  const normalized = githubUsername.toLowerCase()
  const candidates = [
    getIdentityStringField(identity, 'githubUsername'),
    getIdentityStringField(identity, 'nickname'),
    getIdentityStringField(identity, 'preferredUsername'),
    getIdentityStringField(identity, 'username'),
  ]

  return candidates.some(
    (candidate) => candidate?.toLowerCase() === normalized,
  )
}

export function isAllowedIdentity(identity: UserIdentity): boolean {
  const allowed = getAllowedIdentifiers()

  if (!isAllowlistConfigured()) {
    if (process.env.ALLOW_UNCONFIGURED_ALLOWLIST === 'true') {
      console.warn(
        'Allowlist is not configured; ALLOW_UNCONFIGURED_ALLOWLIST permits all authenticated users.',
      )
      return true
    }

    console.error(
      'Allowlist is not configured; denying edit access. Set ALLOWED_GITHUB_USERNAME, ALLOWED_USER_EMAIL, or ALLOWED_CLERK_USER_ID in the Convex dashboard.',
    )
    return false
  }

  if (allowed.userId && identity.subject === allowed.userId) {
    return true
  }

  const email = identity.email?.toLowerCase()

  if (allowed.email && email === allowed.email) {
    return true
  }

  if (
    allowed.githubUsername &&
    matchesGithubUsername(identity, allowed.githubUsername)
  ) {
    return true
  }

  return false
}
