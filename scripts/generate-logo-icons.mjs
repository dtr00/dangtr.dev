import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = join(rootDir, 'public')
const svg = readFileSync(join(publicDir, 'logo.svg'))

async function writePng(size, filename) {
  await sharp(svg).resize(size, size).png().toFile(join(publicDir, filename))
}

async function writeIco() {
  const sizes = [16, 32, 48]
  const pngBuffers = await Promise.all(
    sizes.map((size) => sharp(svg).resize(size, size).png().toBuffer()),
  )

  const imageCount = pngBuffers.length
  const headerSize = 6 + imageCount * 16
  let offset = headerSize
  const entries = pngBuffers.map((buffer, index) => {
    const entry = {
      width: sizes[index] === 256 ? 0 : sizes[index],
      height: sizes[index] === 256 ? 0 : sizes[index],
      size: buffer.byteLength,
      offset,
    }
    offset += buffer.byteLength
    return entry
  })

  const header = Buffer.alloc(headerSize)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(imageCount, 4)

  entries.forEach((entry, index) => {
    const base = 6 + index * 16
    header.writeUInt8(entry.width, base)
    header.writeUInt8(entry.height, base + 1)
    header.writeUInt8(0, base + 2)
    header.writeUInt8(0, base + 3)
    header.writeUInt16LE(1, base + 4)
    header.writeUInt16LE(32, base + 6)
    header.writeUInt32LE(entry.size, base + 8)
    header.writeUInt32LE(entry.offset, base + 12)
  })

  writeFileSync(
    join(publicDir, 'favicon.ico'),
    Buffer.concat([header, ...pngBuffers]),
  )
}

await writePng(192, 'logo192.png')
await writePng(512, 'logo512.png')
await writeIco()

console.log('Generated favicon.ico, logo192.png, logo512.png')
