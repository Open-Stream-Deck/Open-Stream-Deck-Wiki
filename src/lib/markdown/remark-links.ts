import path from 'node:path'
import type { Root } from 'mdast'
import { visit } from 'unist-util-visit'
import type { VFile } from 'vfile'
import { docsUrl } from '../url'

const EXTERNAL = /^([a-z][a-z\d+.-]*:|\/\/|\/|#)/i
const DOCUMENT = /\.mdx?$/

export function remarkLinks() {
  function resolve(url: string, from: string) {
    if (EXTERNAL.test(url)) return url

    const [target = '', hash] = url.split('#')
    if (!DOCUMENT.test(target)) return url

    const route = path.posix
      .join(path.posix.dirname(from), target)
      .replace(DOCUMENT, '')
      .replace(/(^|\/)index$/, '')

    return docsUrl(route) + (hash ? `#${hash}` : '')
  }

  return (tree: Root, file: VFile) => {
    const from = file.path.split(path.sep).join('/')

    visit(tree, (node) => {
      if (node.type === 'link' || node.type === 'definition') node.url = resolve(node.url, from)
      if (node.type !== 'mdxJsxFlowElement' && node.type !== 'mdxJsxTextElement') return

      for (const attribute of node.attributes) {
        if (
          attribute.type === 'mdxJsxAttribute' &&
          attribute.name === 'href' &&
          typeof attribute.value === 'string'
        ) {
          attribute.value = resolve(attribute.value, from)
        }
      }
    })
  }
}
