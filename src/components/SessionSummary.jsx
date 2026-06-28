// Shown when the player has gone through every question in the session deck.
// Beyond the score, it surfaces a review of the questions answered incorrectly,
// each with the chosen answer, the correct answer, and both explanations.

import { useState } from 'react'
import GlossaryText from './GlossaryText.jsx'

function textOf(question, choiceId) {
  return question.choices.find((c) => c.id === choiceId)?.text ?? ''
}

function ReviewItem({ question, choiceId }) {
  const gotItRight = choiceId === question.answer
  return (
    <li className={`review-item ${gotItRight ? 'ok' : 'ko'}`}>
      <p className="review-question">
        <GlossaryText text={question.question} />
      </p>

      {gotItRight ? (
        <>
          <p className="review-line correct">
            <span className="review-tag">Your answer ✓</span>
            <GlossaryText text={textOf(question, question.answer)} />
          </p>
          <p className="explanation review-explanation">
            <GlossaryText text={question.explanations[question.answer]} />
          </p>
        </>
      ) : (
        <>
          <p className="review-line wrong">
            <span className="review-tag">Your answer</span>
            <GlossaryText text={textOf(question, choiceId)} />
          </p>
          <p className="explanation review-explanation">
            <GlossaryText text={question.explanations[choiceId]} />
          </p>
          <p className="review-line correct">
            <span className="review-tag">Correct answer</span>
            <GlossaryText text={textOf(question, question.answer)} />
          </p>
          <p className="explanation review-explanation">
            <GlossaryText text={question.explanations[question.answer]} />
          </p>
        </>
      )}
    </li>
  )
}

export default function SessionSummary({ total, correct, review, onRestart, onChangeDomains }) {
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
  const mistakes = (review ?? []).filter((r) => !r.correct)
  const [showAll, setShowAll] = useState(false)
  const shown = showAll ? review ?? [] : mistakes

  return (
    <section className="panel summary">
      <h2>Session complete</h2>
      <p className="muted">You went through all {total} questions in this session — no repeats.</p>

      <div className="summary-stats">
        <div className="score-item">
          <span className="score-value">{correct}/{total}</span>
          <span className="score-label">correct</span>
        </div>
        <div className="score-item">
          <span className="score-value">{accuracy}%</span>
          <span className="score-label">accuracy</span>
        </div>
      </div>

      {mistakes.length === 0 ? (
        <p className="review-clear">Perfect run — nothing to review. 🎉</p>
      ) : (
        <div className="review">
          <div className="review-head">
            <h3>
              Review your {mistakes.length} {mistakes.length === 1 ? 'mistake' : 'mistakes'}
            </h3>
            <button
              type="button"
              className="link-button"
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll ? 'Show only mistakes' : 'Show all questions'}
            </button>
          </div>
          <ul className="review-list">
            {shown.map((r, i) => (
              <ReviewItem key={r.question.id ?? i} question={r.question} choiceId={r.choiceId} />
            ))}
          </ul>
        </div>
      )}

      <div className="summary-actions">
        <button className="primary" onClick={onRestart}>
          Restart (reshuffle)
        </button>
        <button className="link-button" onClick={onChangeDomains}>
          Change domains
        </button>
      </div>
    </section>
  )
}
