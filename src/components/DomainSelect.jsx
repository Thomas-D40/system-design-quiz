// US-01 — Choose which domain(s) to practice before starting.

const DOMAIN_LABELS = {
  'system-design': 'System design fundamentals',
  'architecture-archetypes': 'Architecture archetypes',
  mcp: 'MCP architecture',
}

export default function DomainSelect({ domains, counts, selected, onToggle, onStart }) {
  const canStart = selected.length > 0

  return (
    <section className="panel">
      <h2>Choose what to practice</h2>
      <p className="muted">Pick one or more domains, then start an endless practice session.</p>

      <ul className="domain-list">
        {domains.map((domain) => (
          <li key={domain}>
            <label className="domain-option">
              <input
                type="checkbox"
                checked={selected.includes(domain)}
                onChange={() => onToggle(domain)}
              />
              <span className="domain-name">{DOMAIN_LABELS[domain] ?? domain}</span>
              <span className="domain-count">{counts[domain] ?? 0} questions</span>
            </label>
          </li>
        ))}
      </ul>

      <button className="primary" disabled={!canStart} onClick={onStart}>
        Start practising
      </button>
      {!canStart && <p className="hint">Select at least one domain to start.</p>}
    </section>
  )
}
