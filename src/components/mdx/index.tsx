import { components } from '@components'
import type { MDXComponents } from 'mdx/types'
import type { ComponentProps } from 'react'
import { Details, DetailsElement, Heading, Step, Steps, Summary, Table } from './blocks'
import { Callout } from './callout'
import { Card, Cards } from './cards'
import { Pre } from './code-block'
import { Image } from './image'
import { Link } from './link'
import { Mermaid } from './mermaid'
import { CodeGroup, Tab, Tabs } from './tabs'

const headings = Object.fromEntries(
  (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const).map((tag) => [
    tag,
    (props: ComponentProps<typeof tag>) => <Heading as={tag} {...props} />,
  ]),
)

export const mdxComponents: MDXComponents = {
  ...headings,
  a: Link,
  img: Image,
  pre: Pre,
  table: Table,
  details: DetailsElement,
  summary: Summary,
  Callout,
  Card,
  Cards,
  CodeGroup,
  Details,
  Mermaid,
  Step,
  Steps,
  Tab,
  Tabs,
  ...components,
}
