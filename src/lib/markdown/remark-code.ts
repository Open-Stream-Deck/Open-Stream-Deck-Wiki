import type { Code, Root, RootContent } from 'mdast'
import type { ContainerDirective } from 'mdast-util-directive'
import { SKIP, visit } from 'unist-util-visit'
import { component, parseMeta } from './shared'

const GROUP = 'code-group'

function isTab(node: RootContent | undefined): node is Code {
  return node?.type === 'code' && typeof parseMeta(node.meta).tab === 'string'
}

function groupTabs(children: RootContent[]) {
  const result: RootContent[] = []
  let index = 0

  while (index < children.length) {
    const node = children[index]!

    if (!isTab(node) || !isTab(children[index + 1])) {
      result.push(node)
      index++
      continue
    }

    const group: Code[] = []
    while (isTab(children[index])) group.push(children[index++] as Code)

    const wrapper: ContainerDirective = {
      type: 'containerDirective',
      name: GROUP,
      attributes: {},
      children: group,
      data: component('CodeGroup'),
    }
    result.push(wrapper)
  }

  return result
}

export function remarkCode() {
  return (tree: Root) => {
    visit(tree, 'code', (node, index, parent) => {
      if (node.lang === 'mermaid' && parent && index !== undefined) {
        const diagram: ContainerDirective = {
          type: 'containerDirective',
          name: 'mermaid',
          attributes: {},
          children: [],
          data: component('Mermaid', { chart: node.value }),
        }
        parent.children.splice(index, 1, diagram)
        return
      }
      if (node.meta) {
        node.data = {
          ...node.data,
          hProperties: { ...node.data?.hProperties, dataMeta: node.meta },
        }
      }
    })

    visit(tree, (node) => {
      if (node.type === 'containerDirective' && node.name === GROUP) return SKIP
      if ('children' in node && node.children.some((child) => isTab(child as RootContent))) {
        node.children = groupTabs(node.children as RootContent[]) as typeof node.children
      }
    })
  }
}
