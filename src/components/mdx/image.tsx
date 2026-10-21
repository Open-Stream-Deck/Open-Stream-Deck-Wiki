'use client'

import config from '@config'
import { AnimatePresence } from 'motion/react'
import { useCallback, useState, type ComponentProps } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'
import { useMounted } from '@/lib/use-mounted'
import { ImageViewer } from './image-viewer'

export function Image({ src, alt = '', title, width, height, className }: ComponentProps<'img'>) {
  const [open, setOpen] = useState(false)
  const mounted = useMounted()
  const close = useCallback(() => setOpen(false), [])

  if (typeof src !== 'string') return null

  return (
    <span className="my-6 block">
      <button
        type="button"
        aria-label={alt || config.ui.zoomIn}
        onClick={() => setOpen(true)}
        className="mx-auto block cursor-zoom-in rounded-[0.85rem]"
      >
        <img
          src={src}
          alt={alt}
          title={title}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          className={cn('mx-auto', className)}
        />
      </button>
      {title && <span className="mt-2.5 block text-center text-[13px] text-subtle">{title}</span>}

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && <ImageViewer src={src} alt={alt} onClose={close} />}
          </AnimatePresence>,
          document.body,
        )}
    </span>
  )
}
