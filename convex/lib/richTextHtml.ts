export function sanitizeColorValue(value: string): string | null {
  const normalized = value.trim()

  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(normalized)) {
    return normalized.toLowerCase()
  }

  const rgbMatch = normalized.match(
    /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i,
  )

  if (rgbMatch) {
    const channels = [rgbMatch[1], rgbMatch[2], rgbMatch[3]].map(Number)

    if (channels.some((channel) => channel > 255)) {
      return null
    }

    return `rgb(${channels.join(', ')})`
  }

  return null
}

export function rgbStringToHex(color: string): string | null {
  const trimmed = color.trim().toLowerCase()

  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/.test(trimmed)) {
    if (trimmed.length === 4) {
      return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`
    }

    return trimmed
  }

  const rgbMatch = trimmed.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)

  if (!rgbMatch) {
    return null
  }

  const channels = [rgbMatch[1], rgbMatch[2], rgbMatch[3]].map(Number)

  if (channels.some((channel) => channel > 255)) {
    return null
  }

  return `#${channels
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')}`
}

type RichTextHtmlRules = {
  blockTags: ReadonlySet<string>
  inlineTags: ReadonlySet<string>
  normalizeBlockTag: (tag: string, isClosing: boolean) => string
}

function sanitizeSpanStyle(attrs: string): string | null {
  const styleMatch = attrs.match(/\bstyle\s*=\s*["']([^"']*)["']/i)

  if (!styleMatch) {
    return null
  }

  const colorMatch = styleMatch[1].match(/(?:^|;)\s*color\s*:\s*([^;]+)/i)

  if (!colorMatch) {
    return null
  }

  return sanitizeColorValue(colorMatch[1])
}

function normalizeFontTags(html: string): string {
  return html
    .replace(/<font\b([^>]*)>/gi, (_match, attrs: string) => {
      const colorMatch = attrs.match(/color\s*=\s*["']([^"']+)["']/i)

      if (!colorMatch) {
        return ''
      }

      const color = sanitizeColorValue(colorMatch[1])

      return color ? `<span style="color: ${color}">` : ''
    })
    .replace(/<\/font>/gi, '</span>')
}

function createStripHtml() {
  return function stripHtml(html: string): string {
    return html
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }
}

function createSanitizeHtml(rules: RichTextHtmlRules) {
  return function sanitizeHtml(html: string): string {
    if (!html.includes('<')) {
      return escapeRichTextPlainText(html)
    }

    const withoutScripts = html
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')

    const normalized = normalizeFontTags(withoutScripts)

    return normalized.replace(
      /<\/?([a-z0-9]+)(\s[^>]*)?\/?>/gi,
      (match, tagName, attrs = '') => {
        const tag = tagName.toLowerCase()

        if (tag === 'br') {
          return '<br>'
        }

        if (match.startsWith('</')) {
          if (tag === 'span') {
            return rules.inlineTags.has(tag) ? '</span>' : ''
          }

          if (rules.blockTags.has(tag) || rules.inlineTags.has(tag)) {
            return rules.normalizeBlockTag(tag, true)
          }

          return ''
        }

        if (tag === 'span') {
          const color = sanitizeSpanStyle(attrs)

          return color ? `<span style="color: ${color}">` : ''
        }

        if (rules.blockTags.has(tag) || rules.inlineTags.has(tag)) {
          return rules.normalizeBlockTag(tag, false)
        }

        return ''
      },
    )
  }
}

export function escapeRichTextPlainText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const paragraphRules: RichTextHtmlRules = {
  blockTags: new Set(),
  inlineTags: new Set(['b', 'strong', 'i', 'em', 'u', 'span']),
  normalizeBlockTag: (tag, isClosing) => {
    if (tag === 'br') {
      return '<br>'
    }

    return isClosing ? `</${tag}>` : `<${tag}>`
  },
}

const homepageRules: RichTextHtmlRules = {
  blockTags: new Set(['p', 'div']),
  inlineTags: new Set(['b', 'strong', 'i', 'em', 'u', 'span']),
  normalizeBlockTag: (tag, isClosing) => {
    if (tag === 'div' || tag === 'p') {
      return isClosing ? '</p>' : '<p>'
    }

    return isClosing ? `</${tag}>` : `<${tag}>`
  },
}

const stripParagraphHtml = createStripHtml()
const sanitizeParagraphHtmlImpl = createSanitizeHtml(paragraphRules)
const stripHomepageHtml = createStripHtml()
const sanitizeHomepageHtmlImpl = createSanitizeHtml(homepageRules)

export function isParagraphContentEmpty(content: string): boolean {
  return stripParagraphHtml(content).length === 0
}

export function sanitizeParagraphHtml(html: string): string {
  return sanitizeParagraphHtmlImpl(html)
}

export function toParagraphDisplayHtml(content: string): string {
  if (!content) {
    return ''
  }

  return sanitizeParagraphHtmlImpl(content)
}

export const DEFAULT_HOMEPAGE_INTRO_HTML = [
  '<p>Dang Tran</p>',
  '<p>Software Engineer</p>',
  '<p>I like building beautifully crafted real-time efficient solutions.</p>',
  '<p>Currently working on a small growing startup team serving logistic management and resources.</p>',
].join('')

export function isHomepageContentEmpty(content: string): boolean {
  return stripHomepageHtml(content).length === 0
}

export function sanitizeHomepageHtml(html: string): string {
  return sanitizeHomepageHtmlImpl(html)
}

export function toHomepageDisplayHtml(content: string): string {
  if (!content) {
    return DEFAULT_HOMEPAGE_INTRO_HTML
  }

  return sanitizeHomepageHtmlImpl(content)
}
