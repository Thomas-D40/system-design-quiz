// Renders text with glossary terms highlighted; hovering or focusing a term
// shows its definition in a tooltip. Used for the question stem and the
// explanations — the reading/learning surfaces.

import { Fragment, useMemo } from 'react'
import { segmentText } from '../lib/glossary.js'

export default function GlossaryText({ text }) {
  const segments = useMemo(() => segmentText(text), [text])

  return segments.map((seg, i) =>
    seg.type === 'term' ? (
      <Term key={i} value={seg.value} definition={seg.definition} />
    ) : (
      <Fragment key={i}>{seg.value}</Fragment>
    ),
  )
}

function Term({ value, definition }) {
  // tabIndex makes the term keyboard-focusable (so the tooltip is reachable
  // without a mouse and works on tap); aria-label voices the definition.
  return (
    <span className="term" tabIndex={0} role="note" aria-label={`${value}: ${definition}`}>
      {value}
      <span className="term-tooltip" role="tooltip">
        {definition}
      </span>
    </span>
  )
}
