---
title: Деплой
description: Куда и как выложить вики.
---

Вики собирается как обычное приложение Next.js, поэтому подойдёт любая площадка, которая умеет запускать Next.js.

## Переменные окружения

| Переменная             | Пример                     | Зачем                                |
| ---------------------- | -------------------------- | ------------------------------------ |
| `NEXT_PUBLIC_SITE_URL` | `https://docs.example.com` | Метатеги и ссылки для ассистентов ИИ |

## Vercel

::::tabs
:::tab[Через сайт]
1. Импортируйте репозиторий на [vercel.com/new](https://vercel.com/new).
2. Добавьте `NEXT_PUBLIC_SITE_URL` в настройках проекта.
3. Нажмите **Deploy**. Дальше каждый push в `main` выкладывается сам.
:::

:::tab[Через CLI]
```bash
pnpm dlx vercel
```
:::
::::

## Свой сервер

```bash
pnpm install --frozen-lockfile
pnpm build
NEXT_PUBLIC_SITE_URL=https://docs.example.com pnpm start
```

По умолчанию сайт слушает порт `3000`, другой задаётся через `-p`: `pnpm start -p 8080`.

> [!NOTE]
> `NEXT_PUBLIC_SITE_URL` подставляется при сборке, поэтому задавайте её до `pnpm build`.
