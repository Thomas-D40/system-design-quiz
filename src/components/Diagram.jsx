// Renders an optional question diagram. Two kinds (tagged union on `kind`):
//   { kind: "mermaid", source: "<mermaid text>", alt: "..." }  -> rendered client-side to SVG
//   { kind: "image",   src: "diagrams/x.png",    alt: "..." }  -> a static asset under /public
//
// Mermaid is heavy, so its library is dynamically imported the first time a
// mermaid diagram actually appears — text-only questions never pay for it.

import { useEffect, useRef, useState } from 'react'

let mermaidPromise = null
function loadMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then((mod) => {
      const mermaid = mod.default
      mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'strict' })
      return mermaid
    })
  }
  return mermaidPromise
}

let uid = 0

export default function Diagram({ diagram }) {
  if (!diagram) return null

  if (diagram.kind === 'image') {
    // Files in /public are served from the deploy base path.
    const src = import.meta.env.BASE_URL + String(diagram.src).replace(/^\//, '')
    return (
      <figure className="diagram">
        <img src={src} alt={diagram.alt} loading="lazy" />
      </figure>
    )
  }

  if (diagram.kind === 'mermaid') {
    return <MermaidDiagram source={diagram.source} alt={diagram.alt} />
  }

  return null
}

function MermaidDiagram({ source, alt }) {
  const [svg, setSvg] = useState(null)
  const [failed, setFailed] = useState(false)
  const idRef = useRef(`mmd-${++uid}`)

  useEffect(() => {
    let alive = true
    loadMermaid()
      .then((mermaid) => mermaid.render(idRef.current, source))
      .then(({ svg }) => alive && setSvg(svg))
      .catch(() => alive && setFailed(true))
    return () => {
      alive = false
    }
  }, [source])

  // Graceful fallback: if rendering fails, show the source so the question is
  // still answerable rather than broken.
  if (failed) {
    return (
      <figure className="diagram">
        <pre className="diagram-source" aria-label={alt}>{source}</pre>
      </figure>
    )
  }

  if (!svg) {
    return <figure className="diagram diagram-loading muted">Rendering diagram…</figure>
  }

  return (
    <figure
      className="diagram"
      role="img"
      aria-label={alt}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
