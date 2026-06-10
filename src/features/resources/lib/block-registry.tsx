import type { ReactNode } from 'react'

import ResourceImageBlock from '#/features/resources/components/resource-image-block'
import ResourceLinkBlock from '#/features/resources/components/resource-link-block'
import ResourceParagraphBlock from '#/features/resources/components/resource-paragraph-block'
import ResourceTitleBlock from '#/features/resources/components/resource-title-block'
import { isParagraphContentEmpty } from '../../../../convex/lib/richTextHtml'
import { parseLinkBlockContent } from '../../../../convex/features/resources/lib/linkContent'
import type { ResourceBlockItem } from '#/features/resources/lib/resource-page-query'

export type TitleBlockItem = Extract<ResourceBlockItem, { type: 'title' }>
export type ParagraphBlockItem = Extract<ResourceBlockItem, { type: 'paragraph' }>
export type ImageBlockItem = Extract<ResourceBlockItem, { type: 'image' }>
export type LinkBlockItem = Extract<ResourceBlockItem, { type: 'link' }>

type BlockComponentProps<TBlock extends ResourceBlockItem> = {
  block: TBlock
  canEdit: boolean
}

type BlockRegistryEntry<TBlock extends ResourceBlockItem> = {
  isVisible: (block: TBlock) => boolean
  Component: (props: BlockComponentProps<TBlock>) => ReactNode
}

type BlockHandlers = {
  title: BlockRegistryEntry<TitleBlockItem>
  paragraph: BlockRegistryEntry<ParagraphBlockItem>
  image: BlockRegistryEntry<ImageBlockItem>
  link: BlockRegistryEntry<LinkBlockItem>
}

const blockHandlers: BlockHandlers = {
  title: {
    isVisible: (block) => block.content.length > 0,
    Component: ({ block, canEdit }) => (
      <ResourceTitleBlock
        blockId={block._id}
        content={block.content}
        align={block.align}
        canEdit={canEdit}
      />
    ),
  },
  paragraph: {
    isVisible: (block) => !isParagraphContentEmpty(block.content),
    Component: ({ block, canEdit }) => (
      <ResourceParagraphBlock
        blockId={block._id}
        content={block.content}
        align={block.align}
        canEdit={canEdit}
      />
    ),
  },
  image: {
    isVisible: (block) => Boolean(block.imageUrl),
    Component: ({ block, canEdit }) => (
      <ResourceImageBlock
        blockId={block._id}
        content={block.content}
        align={block.align}
        imageUrl={block.imageUrl}
        alt={block.alt}
        canEdit={canEdit}
      />
    ),
  },
  link: {
    isVisible: (block) => {
      const { label, url } = parseLinkBlockContent(block.content)
      return label.trim().length > 0 || url.trim().length > 0
    },
    Component: ({ block, canEdit }) => (
      <ResourceLinkBlock
        blockId={block._id}
        content={block.content}
        align={block.align}
        canEdit={canEdit}
      />
    ),
  },
}

function handleBlock<TResult>(
  block: ResourceBlockItem,
  action: <TBlock extends ResourceBlockItem>(
    entry: BlockRegistryEntry<TBlock>,
    typedBlock: TBlock,
  ) => TResult,
): TResult {
  switch (block.type) {
    case 'title':
      return action(blockHandlers.title, block)
    case 'paragraph':
      return action(blockHandlers.paragraph, block)
    case 'image':
      return action(blockHandlers.image, block)
    case 'link':
      return action(blockHandlers.link, block)
  }
}

export function isBlockVisible(block: ResourceBlockItem): boolean {
  return handleBlock(block, (entry, typedBlock) => entry.isVisible(typedBlock))
}

export function ResourceBlockView({
  block,
  canEdit,
}: {
  block: ResourceBlockItem
  canEdit: boolean
}) {
  return handleBlock(block, (entry, typedBlock) =>
    entry.Component({ block: typedBlock, canEdit }),
  )
}
