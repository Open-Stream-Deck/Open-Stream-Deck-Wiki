import { cp, mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const packageDir = fileURLToPath(new URL('..', import.meta.url))
const rootDir = fileURLToPath(new URL('../..', import.meta.url))
const templateDir = path.join(packageDir, 'template')

const entries = [
  'src',
  'public',
  'content',
  'components',
  'theme.css',
  'wiki.config.ts',
  'next.config.ts',
  'postcss.config.mjs',
  'tsconfig.json',
  'package.json',
  'pnpm-lock.yaml',
  '.gitattributes',
  '.prettierrc',
  '.prettierignore',
  '.editorconfig',
]

await rm(templateDir, { recursive: true, force: true })
await mkdir(templateDir, { recursive: true })

for (const entry of entries) {
  await cp(path.join(rootDir, entry), path.join(templateDir, entry), { recursive: true })
}

await cp(path.join(rootDir, '.gitignore'), path.join(templateDir, 'gitignore'))
await cp(path.join(rootDir, 'LICENSE'), path.join(packageDir, 'LICENSE'))
