# @opensd/create-wiki

Создаёт вики на Next.js: страницы в Markdown, поиск, светлая и тёмная темы, подсветка кода.

## Новая вики

```bash
pnpm create @opensd/wiki my-wiki
```

Команда спросит название и описание, скопирует проект и установит зависимости.

```bash
npm create @opensd/wiki my-wiki
yarn create @opensd/wiki my-wiki
```

## Обновление ядра

В папке вики:

```bash
pnpm dlx @opensd/create-wiki@latest upgrade
```

Заменяются `src/`, `next.config.ts`, `postcss.config.mjs`, `tsconfig.json`, зависимости и скрипты в `package.json`. Ваши `content/`, `public/`, `components/`, `theme.css` и `wiki.config.ts` не трогаются.

## Флаги

| Флаг           | Что делает                                           |
| -------------- | ---------------------------------------------------- |
| `--yes`        | Не задавать вопросы, взять значения по умолчанию     |
| `--no-install` | Не устанавливать зависимости                         |
| `--force`      | Обновить ядро, даже если есть незакоммиченные правки |

## Лицензия

MIT
