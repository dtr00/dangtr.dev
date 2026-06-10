import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

const PATHS = [
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 2],
    [2, 2],
    [2, 1],
    [2, 0],
    [1, 0],
    [1, 1],
  ],
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [0, 1],
    [1, 1],
    [2, 1],
    [0, 2],
    [1, 2],
    [2, 2],
  ],
] as const

const TRAIL_AFTER_HEAD = 1
const FRAME_STEPS = PATHS[0].length
const CELL_SIZE = 3
const CELL_GAP = 1
const GRID_SIZE = CELL_SIZE * 3 + CELL_GAP * 2

type CellState = 'head' | 'trail' | 'empty'

const CELL_OPACITY: Record<Exclude<CellState, 'empty'>, number> = {
  head: 0.85,
  trail: 0.4,
}

function setCell(
  active: Map<string, CellState>,
  row: number,
  col: number,
  state: CellState,
) {
  const key = `${row}-${col}`
  const existing = active.get(key)

  if (state === 'head' || existing !== 'head') {
    active.set(key, state)
  }
}

function buildFrame(step: number): CellState[][] {
  const active = new Map<string, CellState>()

  for (const path of PATHS) {
    for (let trail = 0; trail <= TRAIL_AFTER_HEAD; trail++) {
      const index = (step - trail + path.length * 8) % path.length
      const [row, col] = path[index]
      setCell(active, row, col, trail === 0 ? 'head' : 'trail')
    }
  }

  return Array.from({ length: 3 }, (_, row) =>
    Array.from({ length: 3 }, (_, col) => active.get(`${row}-${col}`) ?? 'empty'),
  )
}

function cellPosition(index: number) {
  return index * (CELL_SIZE + CELL_GAP)
}

function LoadingGrid({ className }: { className?: string }) {
  const [step, setStep] = useState(0)
  const [motionEnabled, setMotionEnabled] = useState(true)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    setMotionEnabled(!media.matches)

    function onChange(event: MediaQueryListEvent) {
      setMotionEnabled(!event.matches)
    }

    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!motionEnabled) {
      return
    }

    const interval = window.setInterval(() => {
      setStep((current) => (current + 1) % FRAME_STEPS)
    }, 175)

    return () => window.clearInterval(interval)
  }, [motionEnabled])

  const frame = buildFrame(step)

  return (
    <svg
      aria-hidden
      className={cn('size-3.5 shrink-0 text-muted-foreground', className)}
      viewBox={`0 0 ${GRID_SIZE} ${GRID_SIZE}`}
    >
      {frame.map((row, rowIndex) =>
        row.map((state, colIndex) => {
          if (state === 'empty') {
            return null
          }

          return (
            <rect
              key={`${rowIndex}-${colIndex}`}
              x={cellPosition(colIndex)}
              y={cellPosition(rowIndex)}
              width={CELL_SIZE}
              height={CELL_SIZE}
              fill="currentColor"
              fillOpacity={CELL_OPACITY[state]}
            />
          )
        }),
      )}
    </svg>
  )
}

export { LoadingGrid }
