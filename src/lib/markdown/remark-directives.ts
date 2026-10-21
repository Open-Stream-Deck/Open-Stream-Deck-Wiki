import type { Parent, PhrasingContent, Root, RootContent, Text } from 'mdast'
import type { ContainerDirective, LeafDirective, TextDirective } from 'mdast-util-directive'
import { toString } from 'mdast-util-to-string'
import { SKIP, visit } from 'unist-util-visit'
import { CALLOUT_TYPES, component } from './shared'

function takeLabel(node: ContainerDirective) {
  const first = node.children[0]
  if (first?.type !== 'paragraph' || !first.data?.directiveLabel) return undefined
  node.children.shift()
  return toString(first)
}

function transformContainer(node: ContainerDirective) {
  const type = CALLOUT_TYPES[node.name]
  const label = takeLabel(node)
  const attributes = node.attributes ?? {}

  if (type) {
    node.data = component('Callout', { type, title: label })
    return
  }

  switch (node.name) {
    case 'steps':
      node.data = component('Steps')
      break
    case 'tabs':
      node.data = component('Tabs', { id: attributes.id ?? undefined })
      break
    case 'tab':
      node.data = component('Tab', { value: label ?? attributes.value ?? undefined })
      break
    case 'details':
      node.data = component('Details', { summary: label })
      break
  }
}

function text(value: string): Text {
  return { type: 'text', value }
}

function restore(node: TextDirective | LeafDirective): PhrasingContent[] {
  const prefix = node.type === 'leafDirective' ? '::' : ':'
  const attributes = Object.entries(node.attributes ?? {})
    .map(([key, value]) => (value ? `${key}="${value}"` : key))
    .join(' ')

  return [
    text(prefix + node.name),
    ...(node.children.length ? [text('['), ...node.children, text(']')] : []),
    ...(attributes ? [text(`{${attributes}}`)] : []),
  ]
}

function mergeText(tree: Root) {
  visit(tree, (node) => {
    if (!('children' in node)) return

    const parent = node as Parent
    parent.children = parent.children.reduce<RootContent[]>((merged, child) => {
      const previous = merged.at(-1)
      if (previous?.type === 'text' && child.type === 'text') previous.value += child.value
      else merged.push(child)
      return merged
    }, [])
  })
}

export function remarkDirectives() {
  return (tree: Root) => {
    visit(tree, (node, index, parent) => {
      if (node.type === 'containerDirective') {
        transformContainer(node)
        return
      }
      if (node.type !== 'textDirective' && node.type !== 'leafDirective') return
      if (!parent || index === undefined) return

      const restored = restore(node)
      const replacement: RootContent[] =
        node.type === 'leafDirective' ? [{ type: 'paragraph', children: restored }] : restored

      parent.children.splice(index, 1, ...(replacement as typeof parent.children))
      return [SKIP, index + replacement.length]
    })

    mergeText(tree)
  }
}
