import { Show, useClerk } from '@clerk/tanstack-react-start'
import { Command } from 'cmdk'
import { LogIn, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'

import { signInModalProps } from '#/features/auth/lib/clerk-sign-in'

export default function CommandMenu() {
  const [open, setOpen] = useState(false)
  const clerk = useClerk()

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((current) => !current)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  function runCommand(command: () => void) {
    setOpen(false)
    command()
  }

  function openSignIn() {
    clerk.openSignIn(signInModalProps)
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command menu"
      overlayClassName="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      contentClassName="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
    >
      <Command className="flex flex-col">
        <Command.Input
          placeholder="Type a command..."
          className="w-full border-none bg-transparent px-1 pb-3 text-lg text-white outline-none placeholder:text-white/35"
        />
        <Command.List className="flex max-h-72 flex-col gap-0.5 overflow-y-auto">
          <Command.Empty className="px-1 py-4 text-sm text-white/45">
            No results found.
          </Command.Empty>

          <Show when="signed-out">
            <Command.Item
              value="sign-in-with-github"
              keywords={['login', 'auth', 'account', 'github']}
              onSelect={() => runCommand(openSignIn)}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-[15px] text-white/85 aria-selected:bg-white/10 aria-selected:text-white"
            >
              <LogIn className="size-4 text-white/50" />
              Sign in with GitHub
            </Command.Item>
          </Show>

          <Show when="signed-in">
            <Command.Item
              value="sign-out"
              keywords={['logout', 'exit']}
              onSelect={() => runCommand(() => clerk.signOut())}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-[15px] text-white/85 aria-selected:bg-white/10 aria-selected:text-white"
            >
              <LogOut className="size-4 text-white/50" />
              Sign out
            </Command.Item>
          </Show>
        </Command.List>
      </Command>
    </Command.Dialog>
  )
}
