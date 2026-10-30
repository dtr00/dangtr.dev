import { IconArrowUp } from '@tabler/icons-react'
import { useCallback, useState } from 'react'

import meowSoundUrl from '#/features/ai/assets/meow.mp3'

type Message = { id: number; from: 'you' | 'cat'; text: string }

const REPLY_DELAY_MS = 450
const GREETING_DELAY_MS = 1100
const GREETING = 'mrrp! meow meow?'
const ENTER_CLASS_NAME =
  'animate-in fade-in slide-in-from-bottom-1 duration-300 motion-reduce:animate-none'

function meowifyWord(word: string) {
  const [, lead, core, trail] = word.match(/^(\W*)(.*?)(\W*)$/) ?? []
  const letters = core.replace(/[^a-z]/gi, '').length
  if (letters === 0) return word
  const meow =
    letters <= 2
      ? 'mew'
      : letters === 3
        ? 'mrr'
        : `m${'e'.repeat(Math.min(letters - 3, 6))}ow`
  if (letters > 1 && core === core.toUpperCase()) {
    return lead + meow.toUpperCase() + trail
  }
  if (core[0] !== core[0].toLowerCase()) {
    return lead + meow[0].toUpperCase() + meow.slice(1) + trail
  }
  return lead + meow + trail
}

function meowify(text: string) {
  return text
    .split(/(\s+)/)
    .map((part) => (part.trim() ? meowifyWord(part) : part))
    .join('')
}

function CatAvatar() {
  return (
    <img
      src="/logo192.png"
      alt=""
      width={24}
      height={24}
      className="size-6 shrink-0 rounded-full border border-border"
    />
  )
}

let meowSound: HTMLAudioElement | null = null

// Browsers block sound until the visitor has interacted, so the greeting may
// stay silent; replies always follow a send, which counts as interaction.
function playMeow() {
  meowSound ??= new Audio(meowSoundUrl)
  meowSound.currentTime = 0
  meowSound.play().catch(() => {})
}

function stickToBottom(element: HTMLElement | null) {
  const list = element?.parentElement
  if (list) list.scrollTop = list.scrollHeight
}

export default function MeowChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(true)

  const greet = useCallback((list: HTMLOListElement | null) => {
    if (!list) return
    const timer = setTimeout(() => {
      setTyping(false)
      playMeow()
      setMessages((current) => [
        { id: -1, from: 'cat', text: GREETING },
        ...current,
      ])
    }, GREETING_DELAY_MS)
    return () => clearTimeout(timer)
  }, [])

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return
    setDraft('')
    setMessages((current) => [
      ...current,
      { id: current.length, from: 'you', text },
    ])
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      playMeow()
      setMessages((current) => [
        ...current,
        { id: current.length, from: 'cat', text: meowify(text) },
      ])
    }, REPLY_DELAY_MS)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ol
        ref={greet}
        aria-live="polite"
        aria-label="ai chat"
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto py-3 text-base"
      >
        {messages.map((message) => (
          <li
            key={message.id}
            ref={stickToBottom}
            className={
              message.from === 'you'
                ? `${ENTER_CLASS_NAME} max-w-[85%] self-end rounded-lg bg-white/10 px-3 py-1.5 break-words text-foreground`
                : `${ENTER_CLASS_NAME} flex max-w-[85%] items-start gap-2 self-start break-words text-muted-foreground`
            }
          >
            {message.from === 'cat' ? <CatAvatar /> : null}
            <span className="min-w-0">{message.text}</span>
          </li>
        ))}
        {typing ? (
          <li
            ref={stickToBottom}
            className={`${ENTER_CLASS_NAME} flex items-start gap-2 text-muted-foreground`}
          >
            <CatAvatar />
            <span className="animate-pulse motion-reduce:animate-none">…</span>
          </li>
        ) : null}
      </ol>
      <form
        onSubmit={onSubmit}
        className="flex items-center gap-2 rounded-lg bg-muted p-2"
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="ask me anything"
          aria-label="ask me anything"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent px-1 text-base text-foreground outline-none placeholder:text-muted-foreground/60"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          aria-label="send"
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-opacity disabled:opacity-30"
        >
          <IconArrowUp aria-hidden size={16} stroke={2} />
        </button>
      </form>
    </div>
  )
}
