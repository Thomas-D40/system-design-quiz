// US-02/03/04 — Answer a question, get immediate explained feedback, go next.
// This component owns the per-question answer state; remounting it (via a `key`
// on the question id) resets that state cleanly for each new question.

import { useState } from 'react'
import Diagram from './Diagram.jsx'
import GlossaryText from './GlossaryText.jsx'

export default function QuestionCard({ question, position, total, isLast, onAnswered, onNext }) {
  const [choiceId, setChoiceId] = useState(null)
  const revealed = choiceId !== null

  function handlePick(id) {
    if (revealed) return // locked once answered (US-03)
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
        {question.choices.map((choice) => {
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
                <span className="choice-key">{choice.id.toUpperCase()}</span>
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
            <strong>Your choice ({choiceId.toUpperCase()}):</strong>{' '}
            <GlossaryText text={question.explanations[choiceId]} />
          </p>

          {!isCorrect && (
            <p className="explanation">
              <strong>Correct answer ({question.answer.toUpperCase()}):</strong>{' '}
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
