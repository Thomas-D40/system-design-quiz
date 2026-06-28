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

export default function App() {
  const [screen, setScreen] = useState('select') // 'select' | 'practice' | 'summary'
  const [selected, setSelected] = useState(loadSelectedDomains)
  const [progress, setProgress] = useState(loadProgress)

  // A session is a shuffled deck of distinct questions plus a cursor into it.
  const [deck, setDeck] = useState([])
  const [pos, setPos] = useState(0)
  const [sessionLog, setSessionLog] = useState([]) // [{ id, correct }] for this session

  const pool = useMemo(() => eligiblePool(ALL_QUESTIONS, selected), [selected])
  const current = deck[pos] ?? null
  const isLast = deck.length > 0 && pos === deck.length - 1
  const sessionCorrect = sessionLog.filter((e) => e.correct).length

  function toggleDomain(domain) {
    setSelected((prev) => {
      const next = prev.includes(domain)
        ? prev.filter((d) => d !== domain)
        : [...prev, domain]
      saveSelectedDomains(next)
      return next
    })
  }

  function beginSession() {
    setDeck(shuffle(pool))
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
    setSessionLog((prev) => [...prev, { id: result.questionId, correct: result.correct }])
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
            onRestart={beginSession}
            onChangeDomains={backToSelect}
          />
        )}
      </main>
    </div>
  )
}
