import type { Root } from 'mdast'
import GithubSlugger from 'github-slugger'
import { toString } from 'mdast-util-to-string'
import { visit } from 'unist-util-visit'
import type { VFile } from 'vfile'

export interface TocItem {
  id: string
  title: string
  depth: number
}

declare module 'vfile' {
  interface DataMap {
    toc: TocItem[]
  }
}

const CUSTOM_ID = /\s*\{#([\p{L}\p{N}_-]+)\}\s*$/u

export function remarkHeadings({ minDepth = 2, maxDepth = 4 } = {}) {
  return (tree: Root, file: VFile) => {
    const slugger = new GithubSlugger()
    const toc: TocItem[] = []

    visit(tree, 'heading', (node) => {
      const last = node.children.at(-1)
      const custom = last?.type === 'text' ? last.value.match(CUSTOM_ID) : null

      if (custom && last?.type === 'text') last.value = last.value.slice(0, custom.index)

      const title = toString(node).trim()
      const id = custom?.[1] ?? slugger.slug(title)

      node.data = { ...node.data, hProperties: { ...node.data?.hProperties, id } }

      if (node.depth < minDepth || node.depth > maxDepth) return
      toc.push({ id, title, depth: node.depth })
    })

    file.data.toc = toc
  }
}
