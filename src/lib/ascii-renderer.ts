export type AsciiScene = {
  width: number
  height: number
  fade?: (x: number, y: number) => number
  fontSize?: (width: number) => number
}

const RAMP = ' .:-=+*#%@'
const TONES = [0.4, 0.62, 0.82, 1]
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(
  (value) => (value + 0.5) / 16,
)
const SUPERSAMPLE = 3
const FONT_FAMILY = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'

function toneFor(level: number) {
  return Math.min(
    TONES.length - 1,
    Math.floor((level / RAMP.length) * TONES.length),
  )
}

export function createAsciiRenderer(
  canvas: HTMLCanvasElement,
  {
    width: sceneWidth,
    height: sceneHeight,
    fade: fadeAt,
    fontSize: fontSizeFor = (width) => (width < 480 ? 7 : 10),
  }: AsciiScene,
) {
  const output = canvas.getContext('2d')
  const scene = document.createElement('canvas').getContext('2d', {
    willReadFrequently: true,
  })
  if (!output || !scene) return null

  let columns = 0
  let rows = 0
  let cellWidth = 0
  let cellHeight = 0
  let fade = new Float32Array()

  const layout = () => {
    const { width, height } = canvas.getBoundingClientRect()
    if (!width || !height) return
    const ratio = window.devicePixelRatio || 1
    const fontSize = fontSizeFor(width)
    const font = `${fontSize}px ${FONT_FAMILY}`
    canvas.width = Math.round(width * ratio)
    canvas.height = Math.round(height * ratio)
    output.font = font
    cellWidth = output.measureText('M').width
    cellHeight = fontSize
    columns = Math.floor(width / cellWidth)
    rows = Math.floor(height / cellHeight)
    output.setTransform(
      (ratio * width) / (columns * cellWidth),
      0,
      0,
      (ratio * height) / (rows * cellHeight),
      0,
      0,
    )
    output.font = font
    output.textBaseline = 'top'

    scene.canvas.width = columns * SUPERSAMPLE
    scene.canvas.height = rows * SUPERSAMPLE
    scene.setTransform(
      (columns * SUPERSAMPLE) / sceneWidth,
      0,
      0,
      (rows * SUPERSAMPLE) / sceneHeight,
      0,
      0,
    )
    scene.imageSmoothingQuality = 'high'

    fade = new Float32Array(columns * rows)
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        fade[row * columns + column] = fadeAt
          ? fadeAt((column + 0.5) / columns, (row + 0.5) / rows)
          : 1
      }
    }
  }

  const draw = (paint: (context: CanvasRenderingContext2D) => void) => {
    if (!columns || !rows) return
    paint(scene)
    const pixels = scene.getImageData(
      0,
      0,
      columns * SUPERSAMPLE,
      rows * SUPERSAMPLE,
    ).data
    const stride = columns * SUPERSAMPLE * 4
    const samples = SUPERSAMPLE * SUPERSAMPLE * 255
    const lines = TONES.map(() => new Array<string>(rows))

    for (let row = 0; row < rows; row += 1) {
      const toneRows = TONES.map(() => new Array<string>(columns).fill(' '))
      for (let column = 0; column < columns; column += 1) {
        let sum = 0
        for (let dy = 0; dy < SUPERSAMPLE; dy += 1) {
          const offset =
            (row * SUPERSAMPLE + dy) * stride + column * SUPERSAMPLE * 4
          for (let dx = 0; dx < SUPERSAMPLE; dx += 1) {
            sum += pixels[offset + dx * 4]
          }
        }
        const lightness = (sum / samples) * fade[row * columns + column]
        const threshold = BAYER[(row % 4) * 4 + (column % 4)]
        const level = Math.min(
          RAMP.length - 1,
          Math.floor(lightness * (RAMP.length - 1) + threshold),
        )
        if (level > 0) toneRows[toneFor(level)][column] = RAMP[level]
      }
      toneRows.forEach((characters, tone) => {
        lines[tone][row] = characters.join('')
      })
    }

    output.clearRect(0, 0, columns * cellWidth, rows * cellHeight)
    TONES.forEach((tone, index) => {
      const value = Math.round(tone * 255)
      output.fillStyle = `rgb(${value}, ${value}, ${value})`
      lines[index].forEach((line, row) => {
        output.fillText(line, 0, row * cellHeight)
      })
    })
  }

  return { layout, draw }
}
