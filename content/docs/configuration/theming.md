---
title: Оформление
description: Цвета, шрифты, тема подсветки кода и иконка.
---

## Цвета

Все цвета заданы CSS-переменными в `theme.css` в корне проекта: светлая тема в `:root`, тёмная в `.dark`.

```css title="theme.css"
:root {
  --bg: #fbfbfa;
  --fg: #141414;
  --accent: #141414;
  --note: oklch(0.55 0.15 250);
}

.dark {
  --bg: #141414;
  --fg: #ffffff;
  --accent: #ffffff;
}
```

| Переменная                                                 | Где используется                        |
| ---------------------------------------------------------- | --------------------------------------- |
| `--bg`, `--surface`, `--elevated`                          | Фон страницы, панелей, всплывающих окон |
| `--fg`, `--prose`, `--muted`, `--subtle`                   | Заголовки, текст, второстепенный текст  |
| `--line`, `--line-strong`                                  | Рамки и разделители                     |
| `--accent`, `--accent-fg`                                  | Главная кнопка                          |
| `--code`                                                   | Фон блоков кода                         |
| `--note`, `--tip`, `--important`, `--warning`, `--caution` | Выноски                                 |

Те же цвета доступны как классы Tailwind: `bg-surface`, `text-muted`, `border-line`.

## Шрифты

Семейства задаются там же, в `theme.css`:

```css title="theme.css"
:root {
  --sans: 'Wix Madefor Text Variable', ui-sans-serif, system-ui, sans-serif;
  --display: 'Wix Madefor Display Variable', ui-sans-serif, sans-serif;
  --mono: 'JetBrains Mono Variable', ui-monospace, monospace;
}
```

`--sans` для текста, `--display` для заголовков, `--mono` для кода. Чтобы подключить другой шрифт, установите пакет Fontsource и импортируйте его в начале `theme.css`:

```bash
pnpm add @fontsource-variable/inter
```

```css title="theme.css"
@import '@fontsource-variable/inter';

:root {
  --sans: 'Inter Variable', ui-sans-serif, system-ui, sans-serif;
}
```

## Подсветка кода

Темы Shiki задаются в конфиге:

```ts title="wiki.config.ts"
codeThemes: {
  light: 'vitesse-light',
  dark: 'vitesse-dark',
},
```

Подойдёт любая [тема Shiki](https://shiki.style/themes). Фон блоков при этом берётся из `--code`.

## Логотип и иконка

Логотип в шапке собирается из `name` в конфиге: первое слово жирным, остальные обычным. Иконка вкладки браузера лежит в `public/icon.svg`, замените файл своим.
