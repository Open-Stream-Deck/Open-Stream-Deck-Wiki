# Open Stream Deck Wiki

Шаблон вики на Next.js. Страницы пишутся в Markdown, всё остальное уже готово: навигация, поиск, светлая и тёмная темы, подсветка кода, анимации.

- CommonMark, GFM, сноски, HTML, KaTeX, Mermaid
- MDX-компоненты: выноски, вкладки, шаги, карточки
- Подсветка кода Shiki на этапе сборки
- Сайдбар из структуры папок, оглавление, хлебные крошки
- Поиск по всем разделам без сервера
- Копирование страницы в Markdown и вопросы к ChatGPT, Claude, Perplexity
- Статическая сборка всех страниц

Next.js 16, React 19, TypeScript, Tailwind CSS 4, Motion, MDX 3.

## Быстрый старт

Нужны Node.js 20.9+ и pnpm.

```bash
pnpm create @opensd/wiki my-wiki
cd my-wiki
pnpm dev
```

Команда спросит название и описание, создаст проект и установит зависимости. Вики откроется на `http://localhost:3000`, полная документация лежит в ней самой.

С npm то же самое делает `npm create @opensd/wiki my-wiki`.

## Структура

```
content/docs/     страницы .md и .mdx
public/           картинки, иконка сайта, статика
components/       свои MDX-компоненты
theme.css         цвета и шрифты
wiki.config.ts    название, ссылки, маршруты, тексты интерфейса
src/              ядро
```

Всё, кроме `src/` и конфигов сборки, принадлежит вам. Ядро обновляется отдельной командой и ваши файлы не трогает.

## Страницы

Каждый файл в `content/docs` становится страницей, папка становится разделом.

```md
---
title: Установка
description: Подзаголовок и описание для поиска
---

Текст страницы.
```

Порядок страниц задаётся в `meta.json` внутри папки:

```json
{
  "title": "Руководства",
  "pages": ["index", "---Основы---", "install", "..."]
}
```

## Настройка

```ts
const config: WikiConfig = {
  name: 'My Project',
  title: 'My Project Docs',
  description: 'Документация моего проекта.',
  home: true,
  docsRoute: '/docs',
  github: 'https://github.com/me/my-project',
}
```

Цвета и шрифты задаются CSS-переменными в `theme.css`, иконка сайта лежит в `public/icon.svg`.

## Обновление

```bash
pnpm dlx @opensd/create-wiki@latest upgrade
```

Команда заменяет `src/`, `next.config.ts`, `postcss.config.mjs`, `tsconfig.json`, зависимости и скрипты в `package.json`. Перед запуском закоммитьте изменения, после проверьте сборку через `pnpm typecheck` и `pnpm build`.

Версии выходят по semver, изменения описаны в [CHANGELOG](./CHANGELOG.md) и [релизах](https://github.com/Open-Stream-Deck/Open-Stream-Deck-Wiki/releases).

## Скрипты

| Команда             | Что делает                     |
| ------------------- | ------------------------------ |
| `pnpm dev`          | Dev-сервер                     |
| `pnpm build`        | Сборка                         |
| `pnpm start`        | Запуск собранного сайта        |
| `pnpm typecheck`    | Проверка типов                 |
| `pnpm format`       | Форматирование                 |
| `pnpm format:check` | Проверка форматирования для CI |

## Деплой

Подходит любая площадка с поддержкой Next.js, например Vercel. Перед сборкой задайте `NEXT_PUBLIC_SITE_URL` с адресом сайта.

## Разработка шаблона

```bash
git clone https://github.com/Open-Stream-Deck/Open-Stream-Deck-Wiki.git
cd Open-Stream-Deck-Wiki
pnpm install
pnpm dev
```

Пакет `@opensd/create-wiki` лежит в `create-wiki/`. Шаблон для него собирается из корня репозитория при публикации.

Релиз:

1. Поднять версию в `package.json` и `create-wiki/package.json`.
2. Описать изменения в `CHANGELOG.md`.
3. Запушить тег `vX.Y.Z`. GitHub Actions создаст релиз и опубликует пакет в npm.

## Лицензия

[MIT](./LICENSE)
