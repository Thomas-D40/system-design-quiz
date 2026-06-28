import { useMemo, useState } from 'react'
import { ALL_QUESTIONS } from './content/index.js'
import { DOMAINS } from './lib/validate.js'
import { eligiblePool, shuffle } from './lib/selection.js'
import { loadProgress, recordAnswer, resetProgress } from './lib/storage.js'
import DomainSelect from './components/DomainSelect.jsx'
import QuestionCard from './components/QuestionCard.jsx'
import Scoreboard from './components/Scoreboard.jsx'
import SessionSummary from './components/SessionSummary.jsx'

const DOMAINS_KEY = 'sdq:domains'
const LENGTH_KEY = 'sdq:length'

// Selectable quiz lengths (number of questions per session).
export const LENGTHS = [30, 45, 60, 75, 90, 120, 150]
const DEFAULT_LENGTH = 30

// Per-domain question counts, shown on the selection screen.
const COUNTS = ALL_QUESTIONS.reduce((acc, q) => {
  acc[q.domain] = (acc[q.domain] ?? 0) + 1
  return acc
}, {})

// US-01 — remember the last domain selection across reloads (best-effort).
function loadSelectedDomains() {
  try {
    const raw = localStorage.getItem(DOMAINS_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    if (Array.isArray(parsed)) return parsed.filter((d) => DOMAINS.includes(d))
  } catch {
    // ignore
  }
  return [...DOMAINS]
}

function saveSelectedDomains(domains) {
  try {
    localStorage.setItem(DOMAINS_KEY, JSON.stringify(domains))
  } catch {
    // ignore
  }
}

function loadLength() {
  try {
    const n = parseInt(localStorage.getItem(LENGTH_KEY), 10)
    if (LENGTHS.includes(n)) return n
  } catch {
    // ignore
  }
  return DEFAULT_LENGTH
}

function saveLength(n) {
  try {
    localStorage.setItem(LENGTH_KEY, String(n))
  } catch {
    // ignore
  }
}

export default function App() {
  const [screen, setScreen] = useState('select') // 'select' | 'practice' | 'summary'
  const [selected, setSelected] = useState(loadSelectedDomains)
  const [length, setLength] = useState(loadLength)
  const [progress, setProgress] = useState(loadProgress)

  // A session is a shuffled deck of distinct questions plus a cursor into it.
  const [deck, setDeck] = useState([])
  const [pos, setPos] = useState(0)
  const [sessionLog, setSessionLog] = useState([]) // [{ id, choiceId, correct }] for this session

  const pool = useMemo(() => eligiblePool(ALL_QUESTIONS, selected), [selected])
  const current = deck[pos] ?? null
  const isLast = deck.length > 0 && pos === deck.length - 1
  const sessionCorrect = sessionLog.filter((e) => e.correct).length

  // A length the current pool can actually satisfy: if the chosen length exceeds
  // the eligible pool, fall back to the largest length that fits (or the whole pool).
  const effectiveLength =
    length <= pool.length
      ? length
      : LENGTHS.filter((l) => l <= pool.length).pop() ?? pool.length

  // Per-failed-question review data for the summary: pair each logged answer with
  // its full question object so we can show the explanation and the right answer.
  const review = useMemo(() => {
    const byId = new Map(deck.map((q) => [q.id, q]))
    return sessionLog
      .map((e) => ({ question: byId.get(e.id), choiceId: e.choiceId, correct: e.correct }))
      .filter((r) => r.question)
  }, [sessionLog, deck])

  function toggleDomain(domain) {
    setSelected((prev) => {
      const next = prev.includes(domain)
        ? prev.filter((d) => d !== domain)
        : [...prev, domain]
      saveSelectedDomains(next)
      return next
    })
  }

  function chooseLength(n) {
    setLength(n)
    saveLength(n)
  }

  function beginSession() {
    setDeck(shuffle(pool).slice(0, effectiveLength))
    setPos(0)
    setSessionLog([])
    setScreen('practice')
  }

  function startPractice() {
    if (!selected.length) return
    beginSession()
  }

  function handleAnswered(result) {
    setProgress((prev) => recordAnswer(prev, result))
    setSessionLog((prev) => [
      ...prev,
      { id: result.questionId, choiceId: result.choiceId, correct: result.correct },
    ])
  }

  function handleNext() {
    if (pos + 1 >= deck.length) {
      setScreen('summary')
    } else {
      setPos((p) => p + 1)
    }
  }

  function handleReset() {
    setProgress(resetProgress())
  }

  function backToSelect() {
    setScreen('select')
    setDeck([])
    setPos(0)
    setSessionLog([])
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 onClick={backToSelect} className="app-title" title="Back to domain selection">
          System Design Quiz
        </h1>
        <Scoreboard stats={progress.stats} onReset={handleReset} />
      </header>

      <main className="app-main">
        {screen === 'select' && (
          <DomainSelect
            domains={DOMAINS}
            counts={COUNTS}
            selected={selected}
            onToggle={toggleDomain}
            lengths={LENGTHS}
            length={effectiveLength}
            maxAvailable={pool.length}
            onChooseLength={chooseLength}
            onStart={startPractice}
          />
        )}

        {screen === 'practice' && (
          <>
            <button className="link-button back" onClick={backToSelect}>
              ← Change domains
            </button>

            {current ? (
              <QuestionCard
                key={current.id}
                question={current}
                position={pos + 1}
                total={deck.length}
                isLast={isLast}
                onAnswered={handleAnswered}
                onNext={handleNext}
              />
            ) : (
              <section className="panel empty">
                <h2>No questions available</h2>
                <p className="muted">
                  There are no questions for the selected domain(s) yet. Pick another domain
                  to keep practising.
                </p>
                <button className="primary" onClick={backToSelect}>
                  Choose domains
                </button>
              </section>
            )}
          </>
        )}

        {screen === 'summary' && (
          <SessionSummary
            total={deck.length}
            correct={sessionCorrect}
            review={review}
            onRestart={beginSession}
            onChangeDomains={backToSelect}
          />
        )}
      </main>
    </div>
  )
}
