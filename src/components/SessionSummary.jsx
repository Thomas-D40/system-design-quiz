// Shown when the player has gone through every question in the session deck.

export default function SessionSummary({ total, correct, onRestart, onChangeDomains }) {
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0

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
