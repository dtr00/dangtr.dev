export const SCENE_WIDTH = 640
export const SCENE_HEIGHT = 320
export const LOOP_SECONDS = 10

export type KoiPondSprites = {
  dock: CanvasImageSource
  leg: CanvasImageSource
  tail: CanvasImageSource
}

export type KoiPondState = {
  time: number
  fishTime: number
  ripples: Array<{ x: number; y: number; age: number }>
}

type Context = CanvasRenderingContext2D
type Point = { x: number; y: number }
type PondPoint = { x: number; depth: number }

const TAU = Math.PI * 2
const WATERLINE_LEFT = 174.8
const WATERLINE_RIGHT = 182.7
const PLATFORM_X = 487.7
const DEPTH_SCALE = 0.55
const SHOULDER = { x: 282.4, y: 98.2 }
const PAW_AT_REST = { x: 210.2, y: 182.2 }
const TAIL_BASE = { x: 519.7, y: 34.4 }
const STRIKE_TIMES = [2.0, 7.0]
const RIPPLE_SECONDS = 3.2
const RIPPLE_OFFSETS = [0, 0.45, 0.9, 1.35]
export const RIPPLE_LIFETIME = RIPPLE_SECONDS + 1.35

const LEG_KEYS: Array<[time: number, angle: number, stretch: number]> = [
  [0, 0.07, 1],
  [0.8, 0.05, 1],
  [1.3, 0.12, 0.98],
  [1.75, 0.32, 0.94],
  [1.93, 0.08, 1],
  [2.0, -0.05, 1.06],
  [2.15, -0.07, 1.07],
  [2.45, 0, 1.04],
  [2.9, 0.16, 0.98],
  [3.5, 0.08, 1],
  [4.6, 0.05, 1],
  [5.6, 0.1, 0.99],
  [6.6, 0.28, 0.95],
  [6.92, 0.06, 1],
  [7.0, -0.04, 1.05],
  [7.2, -0.06, 1.06],
  [7.6, 0.03, 1.02],
  [8.4, 0.12, 0.99],
  [9.3, 0.07, 1],
]

function gray(lightness: number, alpha = 1) {
  const value = Math.round(Math.min(1, Math.max(0, lightness)) * 255)
  return `rgba(${value}, ${value}, ${value}, ${alpha})`
}

function seededRandom(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

const random = seededRandom(11)

const glints = Array.from({ length: 70 }, () => ({
  x: random() * PLATFORM_X,
  depth: 6 + random() * 250,
  length: 6 + random() * 24,
  cycles: 1 + Math.floor(random() * 3),
  phase: random() * TAU,
}))

const droplets = Array.from({ length: 9 }, () => ({
  vx: -40 + random() * 80,
  vy: -70 - random() * 50,
  size: 1.6 + random() * 1.6,
}))

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

function wrapTime(time: number) {
  return ((time % LOOP_SECONDS) + LOOP_SECONDS) % LOOP_SECONDS
}

function pulse(time: number, event: number, width: number) {
  const delta = wrapTime(time - event)
  const nearest = Math.min(delta, LOOP_SECONDS - delta)
  return Math.exp(-((nearest / width) ** 2))
}

function waterline(x: number) {
  return WATERLINE_LEFT + (WATERLINE_RIGHT - WATERLINE_LEFT) * (x / PLATFORM_X)
}

function toScreen(point: PondPoint): Point {
  return { x: point.x, y: waterline(point.x) + point.depth * DEPTH_SCALE }
}

function keyAt(index: number) {
  const count = LEG_KEYS.length
  const [time, angle, stretch] = LEG_KEYS[((index % count) + count) % count]
  return {
    time: time + Math.floor(index / count) * LOOP_SECONDS,
    angle,
    stretch,
  }
}

function legPose(time: number) {
  const t = wrapTime(time)
  let index = 0
  while (index + 1 < LEG_KEYS.length && LEG_KEYS[index + 1][0] <= t) index += 1

  const before = keyAt(index - 1)
  const from = keyAt(index)
  const to = keyAt(index + 1)
  const after = keyAt(index + 2)
  const span = to.time - from.time
  const u = (t - from.time) / span
  const h00 = 2 * u ** 3 - 3 * u ** 2 + 1
  const h10 = u ** 3 - 2 * u ** 2 + u
  const h01 = -2 * u ** 3 + 3 * u ** 2
  const h11 = u ** 3 - u ** 2
  const channel = (key: 'angle' | 'stretch') =>
    h00 * from[key] +
    h10 * span * ((to[key] - before[key]) / (to.time - before.time)) +
    h01 * to[key] +
    h11 * span * ((after[key] - from[key]) / (after.time - from.time))

  return { angle: channel('angle'), stretch: channel('stretch') }
}

function pawTip(time: number): Point {
  const { angle, stretch } = legPose(time)
  const dx = (PAW_AT_REST.x - SHOULDER.x) * stretch
  const dy = (PAW_AT_REST.y - SHOULDER.y) * stretch
  return {
    x: SHOULDER.x + dx * Math.cos(angle) - dy * Math.sin(angle),
    y: SHOULDER.y + dx * Math.sin(angle) + dy * Math.cos(angle),
  }
}

type Koi = {
  angle: (time: number) => number
  path: (angle: number) => PondPoint
  length: number
  body: number
  belly: number
  marking: number
  spots: Array<[along: number, offset: number, radius: number]>
  beats: number
  phase: number
}

const kois: Koi[] = [
  {
    angle: (time) =>
      (TAU * (time - STRIKE_TIMES[0])) / LOOP_SECONDS +
      0.3 * Math.sin((2 * TAU * (time - STRIKE_TIMES[0] - 0.3)) / LOOP_SECONDS),
    path: (angle) => ({
      x: 232 + 270 * Math.sin(angle),
      depth: 72 + 40 * Math.sin(2 * angle),
    }),
    length: 180,
    body: 0.66,
    belly: 0.42,
    marking: 0.86,
    spots: [
      [0.12, 0.1, 13],
      [0.45, -0.35, 10],
    ],
    beats: 18,
    phase: 0,
  },
  {
    angle: (time) =>
      -(TAU * time) / LOOP_SECONDS +
      1.2 +
      0.15 * Math.sin((2 * TAU * time) / LOOP_SECONDS + 0.6),
    path: (angle) => ({
      x: 250 + 230 * Math.cos(angle),
      depth: 160 + 62 * Math.sin(angle),
    }),
    length: 196,
    body: 0.92,
    belly: 0.62,
    marking: 0.56,
    spots: [
      [0.08, 0, 16],
      [0.5, 0.4, 9],
    ],
    beats: 15,
    phase: 1.7,
  },
]

function koiWidth(along: number) {
  if (along < 0.2) return 0.6 + 0.4 * Math.sin((along / 0.2) * (Math.PI / 2))
  return 1 - 0.84 * ((along - 0.2) / 0.8) ** 1.25
}

function koiSpine(koi: Koi, time: number) {
  const segments = 18
  const step = koi.length / segments
  const centerline: PondPoint[] = [koi.path(koi.angle(time))]
  let sampleTime = time
  let previous = centerline[0]
  let travelled = 0
  while (centerline.length <= segments) {
    sampleTime -= 0.004
    const point = koi.path(koi.angle(sampleTime))
    travelled += Math.hypot(point.x - previous.x, point.depth - previous.depth)
    previous = point
    while (
      travelled >= step * centerline.length &&
      centerline.length <= segments
    ) {
      centerline.push(point)
    }
  }

  const direction = Math.sign(koi.angle(1) - koi.angle(0))
  const beat = koi.beats * koi.angle(time) * direction + koi.phase
  return centerline.map((point, index) => {
    const along = index / segments
    const ahead = centerline[Math.max(index - 1, 0)]
    const behind = centerline[Math.min(index + 1, segments)]
    const tangent = Math.atan2(ahead.depth - behind.depth, ahead.x - behind.x)
    const sway =
      koi.length *
      (0.012 + 0.02 * along + 0.075 * along ** 2) *
      Math.sin(beat - along * 5.2)
    return {
      x: point.x - Math.sin(tangent) * sway,
      depth: point.depth + Math.cos(tangent) * sway,
      tangent,
      width: koiWidth(along) * koi.length * 0.11,
    }
  })
}

type SpinePoint = ReturnType<typeof koiSpine>[number]

function offsetPoint(point: SpinePoint, sideways: number, forward = 0): Point {
  return toScreen({
    x:
      point.x -
      Math.sin(point.tangent) * point.width * sideways +
      Math.cos(point.tangent) * forward,
    depth:
      point.depth +
      Math.cos(point.tangent) * point.width * sideways +
      Math.sin(point.tangent) * forward,
  })
}

function traceBody(context: Context, spine: SpinePoint[], scale: number) {
  context.beginPath()
  const head = spine[0]
  const start = offsetPoint(head, -scale)
  const nose = offsetPoint(head, 0, head.width * 0.95)
  const end = offsetPoint(head, scale)
  context.moveTo(start.x, start.y)
  context.quadraticCurveTo(nose.x, nose.y, end.x, end.y)
  for (let index = 1; index < spine.length; index += 1) {
    const point = offsetPoint(spine[index], scale)
    context.lineTo(point.x, point.y)
  }
  for (let index = spine.length - 1; index >= 0; index -= 1) {
    const point = offsetPoint(spine[index], -scale)
    context.lineTo(point.x, point.y)
  }
  context.closePath()
}

function drawKoi(context: Context, koi: Koi, time: number) {
  const spine = koiSpine(koi, time)
  const tail = spine[spine.length - 1]
  const tailBase = spine[spine.length - 4]
  const finAngle = Math.atan2(tail.depth - tailBase.depth, tail.x - tailBase.x)
  const finPoint = (spread: number, length: number) =>
    toScreen({
      x: tail.x + Math.cos(finAngle + spread) * length,
      depth: tail.depth + Math.sin(finAngle + spread) * length,
    })

  const root = toScreen(tail)
  const upper = finPoint(-0.55, koi.length * 0.22)
  const notch = finPoint(0, koi.length * 0.1)
  const lower = finPoint(0.55, koi.length * 0.22)
  context.fillStyle = gray(koi.belly + 0.1, 0.55)
  context.beginPath()
  context.moveTo(root.x, root.y)
  context.quadraticCurveTo(
    (root.x + upper.x) / 2,
    (root.y + upper.y) / 2 - 3,
    upper.x,
    upper.y,
  )
  context.quadraticCurveTo(notch.x, notch.y, lower.x, lower.y)
  context.closePath()
  context.fill()

  const flap = Math.sin(koi.beats * 1.4 * koi.angle(time) + koi.phase)
  for (const side of [-1, 1]) {
    const anchor = spine[4]
    const base = offsetPoint(anchor, side * 0.9)
    const sweep = anchor.tangent + Math.PI + side * (1.0 + 0.3 * flap)
    const reach = koi.length * 0.12
    const tip = toScreen({
      x:
        anchor.x -
        Math.sin(anchor.tangent) * anchor.width * side +
        Math.cos(sweep) * reach,
      depth:
        anchor.depth +
        Math.cos(anchor.tangent) * anchor.width * side +
        Math.sin(sweep) * reach,
    })
    const trailing = offsetPoint(spine[6], side * 0.9)
    context.beginPath()
    context.moveTo(base.x, base.y)
    context.quadraticCurveTo(tip.x, tip.y - 2, tip.x, tip.y)
    context.lineTo(trailing.x, trailing.y)
    context.closePath()
    context.fill()
  }

  traceBody(context, spine, 1)
  context.fillStyle = gray(koi.belly)
  context.fill()
  traceBody(context, spine.slice(0, -2), 0.72)
  context.fillStyle = gray(koi.body)
  context.fill()

  context.save()
  traceBody(context, spine, 1)
  context.clip()
  context.fillStyle = gray(koi.marking, 0.9)
  for (const [along, offset, radius] of koi.spots) {
    const center = offsetPoint(
      spine[Math.round(along * (spine.length - 1))],
      offset,
    )
    context.beginPath()
    context.ellipse(center.x, center.y, radius, radius * 0.75, 0, 0, TAU)
    context.fill()
  }
  context.strokeStyle = gray(Math.min(1, koi.body + 0.22), 0.7)
  context.lineWidth = 2.5
  context.beginPath()
  spine.slice(1, -5).forEach((point, index) => {
    const screen = toScreen(point)
    if (index === 0) context.moveTo(screen.x, screen.y)
    else context.lineTo(screen.x, screen.y)
  })
  context.stroke()
  context.restore()

  context.fillStyle = gray(0.05)
  for (const side of [-1, 1]) {
    const eye = offsetPoint(spine[1], side * 0.62)
    context.beginPath()
    context.arc(eye.x, eye.y, 2, 0, TAU)
    context.fill()
  }
}

function drawRipple(context: Context, center: Point, age: number) {
  for (const offset of RIPPLE_OFFSETS) {
    const ringAge = age - offset
    if (ringAge < 0 || ringAge > RIPPLE_SECONDS) continue
    const fade = 1 - ringAge / RIPPLE_SECONDS
    const radius = 8 + ringAge * 78 * (1 - ringAge / 9)
    context.strokeStyle = gray(1, fade ** 1.2 * 0.71)
    context.lineWidth = 3 + 4 * fade
    context.beginPath()
    context.ellipse(
      center.x,
      center.y,
      radius,
      radius * DEPTH_SCALE * 0.75,
      0,
      0,
      TAU,
    )
    context.stroke()
  }
}

function drawWater(
  context: Context,
  { time, fishTime, ripples }: KoiPondState,
  sprites: KoiPondSprites,
) {
  const water = context.createLinearGradient(0, WATERLINE_LEFT, 0, SCENE_HEIGHT)
  water.addColorStop(0, gray(0.13))
  water.addColorStop(1, gray(0.07))
  context.fillStyle = water
  context.fillRect(0, WATERLINE_LEFT - 4, SCENE_WIDTH, SCENE_HEIGHT)

  context.save()
  context.globalAlpha = 0.16
  context.translate(0, 2 * WATERLINE_RIGHT - 6)
  context.scale(1, -1)
  drawLeg(context, time, sprites)
  context.restore()

  context.lineWidth = 1.5
  for (const glint of glints) {
    const shimmer =
      0.5 +
      0.5 * Math.sin((TAU * glint.cycles * time) / LOOP_SECONDS + glint.phase)
    const drift = Math.sin((TAU * time) / LOOP_SECONDS + glint.phase) * 8
    const { x, y } = toScreen({ x: glint.x + drift, depth: glint.depth })
    context.strokeStyle = gray(0.42, shimmer * 0.5)
    context.beginPath()
    context.moveTo(x, y)
    context.lineTo(x + glint.length, y)
    context.stroke()
  }

  const ordered = [...kois].sort(
    (a, b) => a.path(a.angle(fishTime)).depth - b.path(b.angle(fishTime)).depth,
  )
  for (const koi of ordered) drawKoi(context, koi, fishTime)

  for (const strike of STRIKE_TIMES) {
    const age = wrapTime(time - strike)
    const paw = pawTip(strike)
    drawRipple(context, { x: paw.x, y: waterline(paw.x) + 8 }, age)
  }
  for (const ripple of ripples) drawRipple(context, ripple, ripple.age)
}

function drawLeg(context: Context, time: number, sprites: KoiPondSprites) {
  const { angle, stretch } = legPose(time)
  context.save()
  context.translate(SHOULDER.x, SHOULDER.y)
  context.rotate(angle)
  context.scale(stretch, stretch)
  context.translate(-SHOULDER.x, -SHOULDER.y)
  context.drawImage(sprites.leg, 0, 0, SCENE_WIDTH, SCENE_HEIGHT)
  context.restore()
}

function drawTail(context: Context, time: number, sprites: KoiPondSprites) {
  const sway =
    0.05 +
    0.04 * Math.sin((TAU * 2 * time) / LOOP_SECONDS) +
    0.015 * Math.sin((TAU * 5 * time) / LOOP_SECONDS + 1) +
    STRIKE_TIMES.reduce(
      (sum, strike) => sum + 0.05 * pulse(time, strike + 0.5, 0.6),
      0,
    )
  context.save()
  context.translate(TAIL_BASE.x, TAIL_BASE.y)
  context.rotate(-sway)
  context.translate(-TAIL_BASE.x, -TAIL_BASE.y)
  context.drawImage(sprites.tail, 0, 0, SCENE_WIDTH, SCENE_HEIGHT)
  context.restore()
}

function drawSplash(context: Context, time: number) {
  for (const strike of STRIKE_TIMES) {
    const age = wrapTime(time - strike)
    if (age > 0.8) continue
    const origin = pawTip(strike)
    context.fillStyle = gray(0.95, 1 - age / 0.8)
    for (const droplet of droplets) {
      context.beginPath()
      context.arc(
        origin.x + droplet.vx * age,
        waterline(origin.x) + droplet.vy * age + 190 * age * age,
        droplet.size,
        0,
        TAU,
      )
      context.fill()
    }
  }
}

export function isWater(x: number, y: number) {
  return x >= 0 && x < PLATFORM_X && y > waterline(x) + 2 && y <= SCENE_HEIGHT
}

export function drawKoiPondScene(
  context: Context,
  state: KoiPondState,
  sprites: KoiPondSprites,
) {
  const t = wrapTime(state.time)
  context.fillStyle = gray(0)
  context.fillRect(0, 0, SCENE_WIDTH, SCENE_HEIGHT)
  drawWater(context, { ...state, time: t }, sprites)
  drawTail(context, t, sprites)
  context.drawImage(sprites.dock, 0, 0, SCENE_WIDTH, SCENE_HEIGHT)
  drawLeg(context, t, sprites)
  drawSplash(context, t)
}

export function sceneFade(_x: number, y: number) {
  return smoothstep(1, 0.72, y)
}
