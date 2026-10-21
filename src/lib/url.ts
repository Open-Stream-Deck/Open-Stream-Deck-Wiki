import config from '@config'
import type { NavLink } from './config'

const base = `/${config.docsRoute.replace(/^\/+|\/+$/g, '')}`.replace(/^\/$/, '')

export const homeEnabled = config.home && base !== ''

export function docsUrl(path: string | string[] = []) {
  const segments = (Array.isArray(path) ? path : path.split('/')).filter(Boolean)
  return [base, ...segments].join('/') || '/'
}

export function isDocsPath(pathname: string) {
  if (!base) return !(homeEnabled && pathname === '/')
  return pathname === base || pathname.startsWith(`${base}/`)
}

export function navHref(link: NavLink) {
  return 'href' in link ? link.href : docsUrl(link.page)
}

export function segments(url: string) {
  return url.split('/').filter(Boolean)
}

export function rawUrl(url: string) {
  return ['/raw', ...segments(url)].join('/')
}

export function absoluteUrl(path: string) {
  return new URL(path, config.url).toString()
}
