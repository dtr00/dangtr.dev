import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { DEFAULT_RESOURCE_ICON } from '../../../../convex/features/resources/lib/resourceIcons'
import { getTablerIconSync } from '#/features/resources/lib/resource-icons'

export function renderResourceIconSvgs(iconNames: Array<string>) {
  const svgs: Record<string, string> = {}
  const unique = [...new Set(iconNames)]

  for (const name of unique) {
    const Icon =
      getTablerIconSync(name) ?? getTablerIconSync(DEFAULT_RESOURCE_ICON)

    if (!Icon) {
      continue
    }

    svgs[name] = renderToStaticMarkup(
      createElement(Icon, { size: 16, stroke: 1.75, 'aria-hidden': true }),
    )
  }

  return svgs
}
