#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { cp, readFile, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { createInterface } from 'node:readline/promises'
import { fileURLToPath } from 'node:url'

const templateDir = fileURLToPath(new URL('../template', import.meta.url))
const { version } = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))

const coreFiles = ['src', 'next.config.ts', 'postcss.config.mjs', 'tsconfig.json']
const userFiles = ['content', 'public', 'components', 'theme.css', 'wiki.config.ts']

const argv = process.argv.slice(2)
const flags = new Set(argv.filter((arg) => arg.startsWith('-')))
const positional = argv.filter((arg) => !arg.startsWith('-'))
const command = positional[0] === 'upgrade' ? positional.shift() : 'create'

const help = `
Использование:
  pnpm create @opensd/wiki [папка] [--yes] [--no-install]
  pnpm dlx @opensd/create-wiki@latest upgrade [папка] [--force] [--no-install]

Флаги:
  --yes         не задавать вопросы, взять значения по умолчанию
  --no-install  не устанавливать зависимости
  --force       обновить ядро, даже если есть незакоммиченные изменения
`

function fail(message) {
  console.error(`\n✖ ${message}\n`)
  process.exit(1)
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'))
}

async function writeJson(file, value) {
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`)
}

function packageManager() {
  const agent = process.env.npm_config_user_agent?.split('/')[0]
  return ['pnpm', 'npm', 'yarn', 'bun'].includes(agent) ? agent : 'pnpm'
}

function install(target) {
  if (flags.has('--no-install')) return
  const pm = packageManager()
  console.log(`\nУстанавливаю зависимости: ${pm} install\n`)
  const result = spawnSync(`${pm} install`, { cwd: target, stdio: 'inherit', shell: true })
  if (result.status !== 0)
    fail(`Не удалось установить зависимости. Запустите ${pm} install вручную.`)
}

function hasChanges(target) {
  const result = spawnSync('git', ['status', '--porcelain'], { cwd: target, encoding: 'utf8' })
  return result.status === 0 && result.stdout.trim() !== ''
}

const quote = (value) => `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`

function setField(source, key, value) {
  const pattern = new RegExp(`^(\\s*)${key}:\\s*'[^']*',$`, 'm')
  return source.replace(pattern, (_, indent) => `${indent}${key}: ${quote(value)},`)
}

async function create() {
  const interactive = process.stdin.isTTY && !flags.has('--yes')
  const rl = interactive ? createInterface({ input: process.stdin, output: process.stdout }) : null
  const ask = async (question, fallback) => {
    if (!rl) return fallback
    const answer = (await rl.question(`${question} (${fallback}): `)).trim()
    return answer || fallback
  }

  const dir = positional[0] ?? (await ask('Папка проекта', 'my-wiki'))
  const target = path.resolve(process.cwd(), dir)
  const name = path.basename(target).toLowerCase()

  if (!/^[a-z0-9][a-z0-9._-]*$/.test(name)) {
    fail(
      `Имя папки "${name}" не подходит: используйте латиницу, цифры, точку, дефис и подчёркивание.`,
    )
  }
  if (existsSync(target) && readdirSync(target).length > 0) {
    fail(`Папка ${target} не пустая.`)
  }

  const title = await ask('Название вики', 'My Wiki')
  const description = await ask('Описание', 'Документация проекта.')
  rl?.close()

  await cp(templateDir, target, { recursive: true })
  await rename(path.join(target, 'gitignore'), path.join(target, '.gitignore'))

  const packagePath = path.join(target, 'package.json')
  const pkg = await readJson(packagePath)
  pkg.name = name
  pkg.version = '0.1.0'
  pkg.description = description
  delete pkg.repository
  delete pkg.license
  await writeJson(packagePath, pkg)

  const configPath = path.join(target, 'wiki.config.ts')
  let config = await readFile(configPath, 'utf8')
  config = setField(config, 'name', title)
  config = setField(config, 'title', title)
  config = setField(config, 'description', description)
  config = config.replace(/^\s*(github|editUrl): .*,\n/gm, '')
  await writeFile(configPath, config)

  await writeFile(
    path.join(target, 'README.md'),
    [
      `# ${title}`,
      '',
      description,
      '',
      '```bash',
      'pnpm install',
      'pnpm dev',
      '```',
      '',
      'Страницы лежат в `content/docs`, настройки в `wiki.config.ts`, цвета и шрифты в `theme.css`.',
      '',
      'Обновить ядро:',
      '',
      '```bash',
      'pnpm dlx @opensd/create-wiki@latest upgrade',
      '```',
      '',
    ].join('\n'),
  )

  install(target)

  const relative = path.relative(process.cwd(), target) || '.'
  console.log(`\n✔ Вики создана в ${target}\n\nДальше:\n  cd ${relative}\n  pnpm dev\n`)
}

async function upgrade() {
  const target = path.resolve(process.cwd(), positional[0] ?? '.')

  if (!existsSync(path.join(target, 'wiki.config.ts')) || !existsSync(path.join(target, 'src'))) {
    fail(`В ${target} не найдена вики: нет wiki.config.ts или src.`)
  }
  if (!flags.has('--force') && hasChanges(target)) {
    fail('Есть незакоммиченные изменения. Закоммитьте их или запустите с --force.')
  }

  for (const entry of coreFiles) {
    await rm(path.join(target, entry), { recursive: true, force: true })
    await cp(path.join(templateDir, entry), path.join(target, entry), { recursive: true })
  }
  for (const entry of userFiles) {
    if (!existsSync(path.join(target, entry))) {
      await cp(path.join(templateDir, entry), path.join(target, entry), { recursive: true })
    }
  }

  const packagePath = path.join(target, 'package.json')
  const pkg = await readJson(packagePath)
  const core = await readJson(path.join(templateDir, 'package.json'))
  for (const key of ['scripts', 'dependencies', 'devDependencies']) {
    pkg[key] = { ...pkg[key], ...core[key] }
  }
  pkg.engines = core.engines
  pkg.packageManager = core.packageManager
  await writeJson(packagePath, pkg)

  install(target)

  console.log(
    `\n✔ Ядро обновлено до ${version}\n\nПроверьте сборку:\n  pnpm typecheck\n  pnpm build\n`,
  )
}

if (flags.has('--help') || flags.has('-h')) {
  console.log(help)
} else if (command === 'upgrade') {
  await upgrade()
} else {
  await create()
}
