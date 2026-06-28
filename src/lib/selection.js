// Question selection. A practice session draws WITHOUT replacement: starting a
// session builds a shuffled deck of the eligible questions, and the player goes
// through each exactly once before any can repeat. This prevents the early
// repeats you get from naive with-replacement random (the birthday paradox).

/** Questions whose domain is in the selected set. */
export function eligiblePool(allQuestions, selectedDomains) {
  return allQuestions.filter((q) => selectedDomains.includes(q.domain))
}

/** Fisher-Yates shuffle, returning a new array (does not mutate the input). */
export function shuffle(items) {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
