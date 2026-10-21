import { Children, Fragment, isValidElement, type ReactElement, type ReactNode } from 'react'
import { Tab, TabsRoot } from './tabs-client'

type WithProps = ReactElement<Record<string, unknown>>

function elements(children: ReactNode): WithProps[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement<Record<string, unknown>>(child)) return []
    return child.type === Fragment ? elements(child.props.children as ReactNode) : [child]
  })
}

interface TabsProps {
  items?: string[]
  id?: string
  children: ReactNode
}

export function Tabs({ items, id, children }: TabsProps) {
  const labels = items ?? elements(children).map((child) => String(child.props.value ?? ''))
  return (
    <TabsRoot items={labels} id={id}>
      {children}
    </TabsRoot>
  )
}

export function CodeGroup({ id, children }: { id?: string; children: ReactNode }) {
  const blocks = elements(children)
  const labels = blocks.map((block, index) => String(block.props['data-tab'] ?? index + 1))

  return (
    <TabsRoot items={labels} id={id} variant="code">
      {blocks.map((block, index) => (
        <Tab key={labels[index]} value={labels[index]!}>
          {block}
        </Tab>
      ))}
    </TabsRoot>
  )
}

export { Tab }
