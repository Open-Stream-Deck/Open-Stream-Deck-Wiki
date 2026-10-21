---
title: Блоки кода
description: Подсветка Shiki на этапе сборки, заголовки, вкладки, номера строк, диффы и фокус.
---

Код подсвечивается на сервере через [Shiki](https://shiki.style), поэтому в браузер не уходит ни одного лишнего килобайта JavaScript. Светлая и тёмная темы переключаются без перерисовки.

## Заголовок и язык

````md
```ts title="wiki.config.ts"
export default config
```
````

```ts title="src/lib/url.ts"
export function docsUrl(path: string | string[] = []) {
  const segments = (Array.isArray(path) ? path : path.split('/')).filter(Boolean)
  return [base, ...segments].join('/') || '/'
}
```

## Номера строк

```tsx title="src/app/layout.tsx" showLineNumbers
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={config.locale}>
      <body>{children}</body>
    </html>
  )
}
```

## Подсветка строк

Через мету `{1,3-4}` или нотацию `[!code highlight]`:

```ts {2,4-5}
const config: WikiConfig = {
  name: 'My Project',
  locale: 'ru',
  home: true,
  docsRoute: '/docs',
}
```

## Дифф

```ts
pageActions: {
  copyMarkdown: true,
  viewMarkdown: true,
  ai: ['chatgpt', 'claude', 'perplexity'], // [!code --]
  ai: ['claude'], // [!code ++]
}
```

## Фокус

Остальные строки размываются, при наведении всё снова видно.

```ts
const source = getSource()
const page = getPage('/docs/getting-started') // [!code focus]
const { previous, next } = getNeighbours(page)
```

## Ошибки и предупреждения

```ts
docsRoute: 'docs', // [!code warning]
docsRoute: undefined, // [!code error]
```

## Выделение слов

```ts /docsUrl/
docsUrl()
docsUrl('markdown')
navHref({ title: 'Markdown', page: 'markdown' })
```

## Вкладки

Несколько блоков подряд с атрибутом `tab` объединяются в группу:

````md
```bash tab="pnpm"
pnpm install
```

```bash tab="npm"
npm install
```
````

```bash tab="pnpm"
pnpm install
```

```bash tab="npm"
npm install
```

```bash tab="yarn"
yarn
```

## Инлайн-подсветка

Добавьте язык после кода: `const url = docsUrl('markdown'){:ts}` превратится в подсвеченный фрагмент.

## Без языка

```
Обычный текст без подсветки
  с сохранением отступов
```
