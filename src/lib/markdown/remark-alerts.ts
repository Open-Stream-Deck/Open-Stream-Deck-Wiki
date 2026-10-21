import type { Root } from 'mdast'
import { visit } from 'unist-util-visit'
import { CALLOUT_TYPES, component } from './shared'

const MARKER = /^\[!(\w+)\][ \t]*(.*)$/

export function remarkAlerts() {
  return (tree: Root) => {
    visit(tree, 'blockquote', (node) => {
      const paragraph = node.children[0]
      if (paragraph?.type !== 'paragraph') return

      const text = paragraph.children[0]
      if (text?.type !== 'text') return

      const [line = '', ...rest] = text.value.split('\n')
      const match = line.match(MARKER)
      const type = match?.[1] && CALLOUT_TYPES[match[1].toLowerCase()]
      if (!match || !type) return

      text.value = rest.join('\n')
      if (!text.value) paragraph.children.shift()
      if (paragraph.children[0]?.type === 'break') paragraph.children.shift()
      if (!paragraph.children.length) node.children.shift()

      node.data = component('Callout', { type, title: match[2]?.trim() })
    })
  }
}
