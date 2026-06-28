// Build-time content guard. Runs before `vite build` (see package.json) and via
// `npm run validate`. Fails the build if any question is malformed, so bad
// content never ships. Reuses the same validator the app uses at runtime.

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { validateQuestions, validateGlossary } from '../src/lib/validate.js'

const here = dirname(fileURLToPath(import.meta.url))
const contentDir = join(here, '..', 'src', 'content')

const files = ['system-design.json', 'architecture-archetypes.json', 'mcp.json']

async function load(file) {
  const raw = await readFile(join(contentDir, file), 'utf8')
  try {
    return JSON.parse(raw)
  } catch (err) {
    console.error(`✗ ${file}: invalid JSON — ${err.message}`)
    process.exit(1)
  }
}

const lists = await Promise.all(files.map(load))
const all = lists.flat()

const glossary = await load('glossary.json')

const errors = [
  ...validateQuestions(all),
  ...validateGlossary(glossary),
]

if (errors.length) {
  console.error(`✗ Content validation failed (${errors.length} error(s)):`)
  for (const e of errors) console.error('  - ' + e)
  process.exit(1)
}

console.log(
  `✓ Content valid: ${all.length} questions across ${files.length} domain files, ${glossary.length} glossary terms.`,
)
