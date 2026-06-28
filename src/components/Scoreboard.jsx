// US-05/07 — Running stats, plus a reset behind a confirmation.

export default function Scoreboard({ stats, onReset }) {
  const { total, correct } = stats
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0

  function handleReset() {
    if (window.confirm('Reset all progress? This cannot be undone.')) {
      onReset()
    }
  }

  return (
    <aside className="scoreboard">
      <div className="score-item">
        <span className="score-value">{total}</span>
        <span className="score-label">answered</span>
      </div>
      <div className="score-item">
        <span className="score-value">{correct}</span>
        <span className="score-label">correct</span>
      </div>
      <div className="score-item">
        <span className="score-value">{accuracy}%</span>
        <span className="score-label">accuracy</span>
      </div>
      <button className="link-button" onClick={handleReset} disabled={total === 0}>
        Reset
      </button>
    </aside>
  )
}
