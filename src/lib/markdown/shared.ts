import type { Data } from 'mdast'

export type CalloutType = 'note' | 'tip' | 'important' | 'warning' | 'caution'

export const CALLOUT_TYPES: Record<string, CalloutType> = {
  note: 'note',
  info: 'note',
  tip: 'tip',
  success: 'tip',
  important: 'important',
  warning: 'warning',
  caution: 'caution',
  danger: 'caution',
}

export function component(name: string, props: Record<string, string | undefined> = {}): Data {
  const properties: Record<string, string> = { dataComponent: name }

  for (const [key, value] of Object.entries(props)) {
    if (value) properties[`data${key.charAt(0).toUpperCase()}${key.slice(1)}`] = value
  }

  return { hName: 'div', hProperties: properties }
}

export function parseMeta(meta: string | null | undefined) {
  const attributes: Record<string, string | true> = {}
  if (!meta) return attributes

  for (const [, key, ...values] of meta.matchAll(
    /([\w-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s{}]+)))?/g,
  )) {
    if (key) attributes[key] = values.find((value) => value !== undefined) ?? true
  }

  return attributes
}
