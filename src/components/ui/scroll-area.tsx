'use client'

import { useImperativeHandle, useRef, type ComponentProps } from 'react'
import { cn } from '@/lib/cn'
import { Scrollbar, type Orientation } from './scrollbar'

interface ScrollAreaProps extends ComponentProps<'div'> {
  containerClassName?: string
  orientation?: Orientation
}

export function ScrollArea({
  ref,
  className,
  containerClassName,
  orientation = 'vertical',
  children,
  ...props
}: ScrollAreaProps) {
  const viewport = useRef<HTMLDivElement>(null)
  useImperativeHandle(ref, () => viewport.current!)

  return (
    <div className={cn('relative', containerClassName)}>
      <div
        ref={viewport}
        className={cn(
          'scrollbar-none',
          orientation === 'vertical' ? 'overflow-y-auto' : 'overflow-x-auto',
          className,
        )}
        {...props}
      >
        {children}
      </div>
      <Scrollbar target={viewport} orientation={orientation} />
    </div>
  )
}
