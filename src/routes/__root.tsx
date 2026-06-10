import { ClerkProvider, useAuth } from '@clerk/tanstack-react-start'
import type { ConvexQueryClient } from '@convex-dev/react-query'
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  useRouteContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import type { QueryClient } from '@tanstack/react-query'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import type { ConvexReactClient } from 'convex/react'

import CommandMenu from '#/features/shell/components/command-menu'
import Header from '#/features/shell/components/header'
import { TooltipProvider } from '#/components/ui/tooltip'
import { clerkAppearance } from '#/features/auth/lib/clerk-appearance'
import { fetchClerkAuth } from '#/features/auth/server/fetch-clerk-auth'
import appCss from '../styles.css?url'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
  convexClient: ConvexReactClient
  convexQueryClient: ConvexQueryClient
}>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'dangtr.dev',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        href: '/favicon.ico',
      },
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/logo.svg',
      },
    ],
  }),
  beforeLoad: async (ctx) => {
    if (!ctx.context.convexQueryClient.serverHttpClient) {
      return {}
    }

    const { userId, token } = await fetchClerkAuth()

    if (token) {
      ctx.context.convexQueryClient.serverHttpClient.setAuth(token)
    }

    return {
      userId,
      token,
    }
  },
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}

function AppProviders({ children }: { children: React.ReactNode }) {
  const { convexClient } = useRouteContext({ from: Route.id })

  return (
    <ClerkProvider appearance={clerkAppearance}>
      <ConvexProviderWithClerk client={convexClient} useAuth={useAuth}>
        <TooltipProvider>
          <Header />
          <CommandMenu />
          {children}
        </TooltipProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}
