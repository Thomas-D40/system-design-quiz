// Content loader — imports the per-domain JSON files, flattens them into a
// single pool, and validates in development so authoring mistakes surface early.
// Content-as-data: adding a question means editing JSON, never this file.

import systemDesign from './system-design.json'
import architectureArchetypes from './architecture-archetypes.json'
import mcp from './mcp.json'
import { validateQuestions } from '../lib/validate.js'

export const ALL_QUESTIONS = [
  ...systemDesign,
  ...architectureArchetypes,
  ...mcp,
]

if (import.meta.env.DEV) {
  const errors = validateQuestions(ALL_QUESTIONS)
  if (errors.length) {
    console.error(`[content] ${errors.length} validation error(s):\n` + errors.join('\n'))
  }
}
