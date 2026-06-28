// Glossary matching. Given a block of text, find occurrences of known technical
// terms and split the text into plain + term segments so the UI can attach a
// definition tooltip. Content-as-data: terms live in src/content/glossary.json.

import glossary from '../content/glossary.json'

// Longer terms first so multi-word terms (e.g. "CAP theorem", "consistent
// hashing") win over any shorter term contained inside them.
const ENTRIES = [...glossary].sort((a, b) => b.term.length - a.term.length)

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// All-caps terms (acronyms like CAP, CDN, JSON-RPC, MCP) match case-sensitively
// to avoid false hits on ordinary lowercase words; others match insensitively.
function isAcronym(term) {
  return /[A-Z]/.test(term) && term === term.toUpperCase()
}

// Treat letters, digits, _ and - as "word" characters, so "cache" does not
// match inside "cache-aside" and acronyms with hyphens stay intact.
function matcher(term) {
  const flags = isAcronym(term) ? 'g' : 'gi'
  return new RegExp(`(?<![\\w-])${escapeRegExp(term)}(?![\\w-])`, flags)
}

function firstFreeMatch(text, term, taken) {
  const re = matcher(term)
  let m
  while ((m = re.exec(text))) {
    const start = m.index
    const end = start + m[0].length
    const overlaps = taken.some((t) => start < t.end && end > t.start)
    if (!overlaps) return { start, end, value: m[0] }
  }
  return null
}

/**
 * Split `text` into an array of segments:
 *   { type: 'text', value }  or  { type: 'term', value, definition }
 * Only the first non-overlapping occurrence of each term is highlighted, to
 * avoid peppering a paragraph with repeated tooltips.
 */
export function segmentText(text) {
  if (!text || typeof text !== 'string') return [{ type: 'text', value: text ?? '' }]

  const taken = []
  for (const entry of ENTRIES) {
    const hit = firstFreeMatch(text, entry.term, taken)
    if (hit) taken.push({ ...hit, definition: entry.definition })
  }
  if (!taken.length) return [{ type: 'text', value: text }]

  taken.sort((a, b) => a.start - b.start)
  const segments = []
  let cursor = 0
  for (const t of taken) {
    if (t.start > cursor) segments.push({ type: 'text', value: text.slice(cursor, t.start) })
    segments.push({ type: 'term', value: t.value, definition: t.definition })
    cursor = t.end
  }
  if (cursor < text.length) segments.push({ type: 'text', value: text.slice(cursor) })
  return segments
}
