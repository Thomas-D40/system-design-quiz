// Versioned localStorage progression. See the Schema spec for the shape.
// A missing, corrupt, or older-version save must degrade gracefully — never crash.

const STORAGE_KEY = 'sdq:progress'
export const SCHEMA_VERSION = 1

function emptyState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    answered: {},
    stats: { total: 0, correct: 0 },
  }
}

/**
 * Read progression from localStorage, tolerating absence and corruption.
 * Older schema versions are reset (there is only v1 today; this is where a
 * future migration would live).
 */
export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState()

    const parsed = JSON.parse(raw)
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      parsed.schemaVersion !== SCHEMA_VERSION ||
      typeof parsed.answered !== 'object' ||
      typeof parsed.stats !== 'object'
    ) {
      return emptyState()
    }
    return parsed
  } catch {
    // Corrupt JSON or unavailable storage — start clean rather than break.
    return emptyState()
  }
}

function persist(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage may be full or disabled (private mode). Progression is best-effort.
  }
  return state
}

/**
 * Record an answered question and return the new state (immutably).
 * Stats count distinct questions; re-answering an already-answered question
 * updates its record and bumps attempts without double-counting totals.
 */
export function recordAnswer(state, { questionId, choiceId, correct }) {
  const prev = state.answered[questionId]
  const answered = {
    ...state.answered,
    [questionId]: {
      lastChoice: choiceId,
      correct,
      attempts: (prev?.attempts ?? 0) + 1,
    },
  }

  // Recompute stats from the answered map so they stay consistent.
  const records = Object.values(answered)
  const stats = {
    total: records.length,
    correct: records.filter((r) => r.correct).length,
  }

  return persist({ ...state, answered, stats })
}

/** Clear all progression. */
export function resetProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
  return emptyState()
}
