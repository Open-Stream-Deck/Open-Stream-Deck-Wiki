import { ArrowUpRight } from 'lucide-react'
import NextLink from 'next/link'
import type { ComponentProps } from 'react'

const EXTERNAL = /^(https?:)?\/\//

export function Link({ href = '', children, ...props }: ComponentProps<'a'>) {
  if (EXTERNAL.test(href)) {
    return (
      <a href={href} target="_blank" rel="noreferrer" {...props}>
        {children}
        {typeof children === 'string' && (
          <ArrowUpRight className="ml-0.5 inline size-3 align-[0.05em] text-subtle" />
        )}
      </a>
    )
  }

  if (href.startsWith('/')) {
    return (
      <NextLink href={href} {...props}>
        {children}
      </NextLink>
    )
  }

  return (
    <a href={href} {...props}>
      {children}
    </a>
  )
}
