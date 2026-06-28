// US-02/03/04 — Answer a question, get immediate explained feedback, go next.
// This component owns the per-question answer state; remounting it (via a `key`
// on the question id) resets that state cleanly for each new question.

import { useRef, useState } from 'react'
import Diagram from './Diagram.jsx'
import GlossaryText from './GlossaryText.jsx'
import { shuffle } from '../lib/selection.js'

export default function QuestionCard({ question, position, total, isLast, onAnswered, onNext }) {
  const [choiceId, setChoiceId] = useState(null)
  // Lock synchronously on the first pick. `revealed` is derived from state, which
  // updates a tick later — a fast double-click could otherwise fire onAnswered
  // twice before the re-render disables the buttons, double-counting the answer.
  const answeredRef = useRef(false)
  // Randomize choice order once per question (this component remounts per id, so
  // the order stays stable while answering). Display labels are derived from the
  // on-screen position; the stored choice id still drives answer/explanation
  // lookups. This keeps the correct answer from always sitting in the same slot.
  const [choices] = useState(() => shuffle(question.choices))
  const labelOf = (id) =>
    String.fromCharCode(65 + choices.findIndex((c) => c.id === id))
  const revealed = choiceId !== null

  function handlePick(id) {
    if (answeredRef.current) return // locked once answered (US-03)
    answeredRef.current = true
    setChoiceId(id)
    onAnswered({
      questionId: question.id,
      choiceId: id,
      correct: id === question.answer,
    })
  }

  const isCorrect = revealed && choiceId === question.answer

  return (
    <section className="panel">
      <div className="question-meta">
        <span className="tag">{question.domain}</span>
        {question.topic && <span className="tag tag-soft">{question.topic}</span>}
        {question.difficulty && <span className="tag tag-soft">{question.difficulty}</span>}
        {total > 0 && <span className="question-progress">Question {position} of {total}</span>}
      </div>

      <h2 className="question-text"><GlossaryText text={question.question} /></h2>

      {question.diagram && <Diagram diagram={question.diagram} />}

      <ul className="choice-list">
        {choices.map((choice, idx) => {
          const states = []
          if (revealed) {
            if (choice.id === question.answer) states.push('correct')
            if (choice.id === choiceId && choice.id !== question.answer) states.push('wrong')
            if (choice.id === choiceId) states.push('chosen')
          }
          return (
            <li key={choice.id}>
              <button
                className={`choice ${states.join(' ')}`}
                disabled={revealed}
                onClick={() => handlePick(choice.id)}
              >
                <span className="choice-key">{String.fromCharCode(65 + idx)}</span>
                <span className="choice-text">{choice.text}</span>
              </button>
            </li>
          )
        })}
      </ul>

      {revealed && (
        <div className={`feedback ${isCorrect ? 'good' : 'bad'}`}>
          <p className="verdict">{isCorrect ? 'Correct' : 'Not quite'}</p>

          <p className="explanation">
            <strong>Your choice ({labelOf(choiceId)}):</strong>{' '}
            <GlossaryText text={question.explanations[choiceId]} />
          </p>

          {!isCorrect && (
            <p className="explanation">
              <strong>Correct answer ({labelOf(question.answer)}):</strong>{' '}
              <GlossaryText text={question.explanations[question.answer]} />
            </p>
          )}

          <button className="primary" onClick={onNext}>
            {isLast ? 'Finish session' : 'Next question'}
          </button>
        </div>
      )}
    </section>
  )
}
