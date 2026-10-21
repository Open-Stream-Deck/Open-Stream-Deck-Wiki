import type { Element, Properties, Root } from 'hast'
import { visit } from 'unist-util-visit'

function unprefix(key: string) {
  return key.charAt(4).toLowerCase() + key.slice(5)
}

export function rehypeComponents() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      const name = node.properties.dataComponent
      if (typeof name !== 'string') return

      const properties: Properties = {}
      for (const [key, value] of Object.entries(node.properties)) {
        if (key !== 'dataComponent' && key.startsWith('data')) properties[unprefix(key)] = value
      }

      node.tagName = name
      node.properties = properties
    })
  }
}

export function rehypeCodeMeta() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      const meta = node.properties.dataMeta
      if (node.tagName !== 'code' || typeof meta !== 'string') return

      delete node.properties.dataMeta
      node.data = { ...node.data, meta }
    })
  }
}
