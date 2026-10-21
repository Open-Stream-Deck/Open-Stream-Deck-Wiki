'use client'

import { useSyncExternalStore } from 'react'
import { QUERY, STORAGE_KEY } from './theme-script'

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

const EVENT = 'wiki:theme'

function readTheme(): Theme {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : 'system'
  } catch {
    return 'system'
  }
}

function resolve(theme: Theme): ResolvedTheme {
  if (theme !== 'system') return theme
  return window.matchMedia(QUERY).matches ? 'dark' : 'light'
}

function flushStyles(element: HTMLElement) {
  return getComputedStyle(element).opacity
}

function apply(resolved: ResolvedTheme) {
  const root = document.documentElement
  const freeze = document.createElement('style')
  freeze.textContent = '*,*::before,*::after{transition:none!important}'
  document.head.append(freeze)

  root.classList.toggle('dark', resolved === 'dark')
  root.style.colorScheme = resolved

  flushStyles(root)
  requestAnimationFrame(() => freeze.remove())
}

function subscribe(notify: () => void) {
  const media = window.matchMedia(QUERY)
  const onSystemChange = () => {
    if (readTheme() === 'system') apply(resolve('system'))
    notify()
  }

  media.addEventListener('change', onSystemChange)
  window.addEventListener(EVENT, notify)
  window.addEventListener('storage', notify)
  return () => {
    media.removeEventListener('change', onSystemChange)
    window.removeEventListener(EVENT, notify)
    window.removeEventListener('storage', notify)
  }
}

function store(theme: Theme) {
  try {
    if (theme === 'system') localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    return
  }
}

export function setTheme(theme: Theme) {
  store(theme)
  apply(resolve(theme))
  window.dispatchEvent(new Event(EVENT))
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => 'system' as const)
  const resolvedTheme = useSyncExternalStore(
    subscribe,
    () => resolve(readTheme()),
    () => undefined,
  )

  return { theme, resolvedTheme, setTheme }
}
