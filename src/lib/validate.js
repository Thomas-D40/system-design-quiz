// Content validation — the guard that keeps malformed questions from shipping.
// Used both at build time (scripts/validate-content.mjs) and at runtime (content loader).
// See the Schema spec for the authoritative shape.

export const DOMAINS = ['system-design', 'architecture-archetypes', 'mcp']

/**
 * Validate the glossary (term -> definition list).
 * @returns {string[]} error messages (empty = valid).
 */
export function validateGlossary(entries) {
  const errors = []
  if (!Array.isArray(entries)) return ['Glossary is not an array.']

  const seen = new Set()
  entries.forEach((e, i) => {
    if (!e || typeof e !== 'object') {
      errors.push(`glossary entry ${i}: not an object.`)
      return
    }
    if (typeof e.term !== 'string' || !e.term.trim()) {
      errors.push(`glossary entry ${i}: missing "term".`)
    } else {
      const key = e.term.toLowerCase()
      if (seen.has(key)) errors.push(`glossary: duplicate term "${e.term}".`)
      seen.add(key)
    }
    if (typeof e.definition !== 'string' || !e.definition.trim()) {
      errors.push(`glossary entry "${e.term ?? i}": missing "definition".`)
    }
  })
  return errors
}
const DIFFICULTIES = ['easy', 'medium', 'hard']

/**
 * Validate a flat list of question objects.
 * @returns {string[]} a list of human-readable error messages (empty = valid).
 */
export function validateQuestions(questions) {
  const errors = []

  if (!Array.isArray(questions)) {
    return ['Content root is not an array of questions.']
  }

  const seenIds = new Set()

  questions.forEach((q, i) => {
    const where = q && q.id ? `question "${q.id}"` : `question at index ${i}`

    if (!q || typeof q !== 'object') {
      errors.push(`${where}: not an object.`)
      return
    }

    if (!q.id || typeof q.id !== 'string') {
      errors.push(`${where}: missing or non-string "id".`)
    } else if (seenIds.has(q.id)) {
      errors.push(`${where}: duplicate "id".`)
    } else {
      seenIds.add(q.id)
    }

    if (!DOMAINS.includes(q.domain)) {
      errors.push(`${where}: unknown domain "${q.domain}" (expected one of ${DOMAINS.join(', ')}).`)
    }

    if (q.difficulty != null && !DIFFICULTIES.includes(q.difficulty)) {
      errors.push(`${where}: invalid difficulty "${q.difficulty}".`)
    }

    if (!q.question || typeof q.question !== 'string') {
      errors.push(`${where}: missing question text.`)
    }

    if (!Array.isArray(q.choices) || q.choices.length < 2) {
      errors.push(`${where}: needs at least 2 choices.`)
      return
    }

    const choiceIds = new Set()
    q.choices.forEach((c, ci) => {
      if (!c || typeof c.id !== 'string' || typeof c.text !== 'string') {
        errors.push(`${where}: choice at index ${ci} must have string "id" and "text".`)
        return
      }
      if (choiceIds.has(c.id)) {
        errors.push(`${where}: duplicate choice id "${c.id}".`)
      }
      choiceIds.add(c.id)
    })

    if (!q.answer || !choiceIds.has(q.answer)) {
      errors.push(`${where}: "answer" ("${q.answer}") does not match any choice id.`)
    }

    if (!q.explanations || typeof q.explanations !== 'object') {
      errors.push(`${where}: missing "explanations" object.`)
    } else {
      // Every choice must have an explanation, so feedback is contextual either way.
      choiceIds.forEach((cid) => {
        if (typeof q.explanations[cid] !== 'string' || !q.explanations[cid].trim()) {
          errors.push(`${where}: missing explanation for choice "${cid}".`)
        }
      })
    }

    // Optional diagram (tagged union on `kind`). See the Diagram component.
    if (q.diagram != null) {
      const d = q.diagram
      if (typeof d !== 'object') {
        errors.push(`${where}: "diagram" must be an object.`)
      } else if (!['mermaid', 'image'].includes(d.kind)) {
        errors.push(`${where}: diagram "kind" must be "mermaid" or "image".`)
      } else {
        if (typeof d.alt !== 'string' || !d.alt.trim()) {
          errors.push(`${where}: diagram needs a non-empty "alt" (accessibility).`)
        }
        if (d.kind === 'mermaid' && (typeof d.source !== 'string' || !d.source.trim())) {
          errors.push(`${where}: mermaid diagram needs a non-empty "source".`)
        }
        if (d.kind === 'image' && (typeof d.src !== 'string' || !d.src.trim())) {
          errors.push(`${where}: image diagram needs a non-empty "src".`)
        }
      }
    }
  })

  return errors
}
