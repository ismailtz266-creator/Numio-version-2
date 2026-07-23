import { useState } from 'react'

// ── Icons ─────────────────────────────────────────────────────────

function XIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 20 20" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <path d="M4 4l12 12M16 4L4 16" />
    </svg>
  )
}

// ── Quit popup ────────────────────────────────────────────────────

function QuitPopup({ visible, onStay, onLeave }) {
  if (!visible) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 70,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'flex-end',
      background: 'rgba(255,255,255,0.92)',
    }}>
      <div style={{
        background: 'white', borderRadius: 24,
        border: '2px solid #e5e7eb', padding: '20px 24px',
        maxWidth: 320, width: '90%', marginBottom: 16,
        boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 16,
      }}>
        <p style={{
          fontFamily: "'Baloo 2', sans-serif",
          fontWeight: 700, fontSize: 18,
          color: '#3c3c3c', textAlign: 'center', lineHeight: 1.4, margin: 0,
        }}>
          Leave the quiz? 😢<br />Your progress won't be saved.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
          <button onClick={onStay} style={{
            width: '100%', border: 'none', cursor: 'pointer',
            padding: '14px 0', borderRadius: 14,
            background: '#58cc02', boxShadow: '0 4px 0 #46a302',
            color: '#fff', fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 800, fontSize: 16, letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            KEEP GOING 💪
          </button>
          <button onClick={onLeave} style={{
            width: '100%', border: 'none', cursor: 'pointer',
            padding: '12px 0', borderRadius: 14,
            background: 'none', color: '#9ca3af',
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 700, fontSize: 14,
          }}>
            Yes, leave
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Results screen ────────────────────────────────────────────────

function ResultsScreen({ questions, answers, topic, onDone }) {
  const correct = questions.filter((q, i) => answers[i] === q.correct_answer).length
  const total   = questions.length
  const pct     = Math.round((correct / total) * 100)

  const emoji = pct === 100 ? '🏆' : pct >= 80 ? '🎉' : pct >= 60 ? '😊' : '💪'
  const msg   = pct === 100 ? 'Perfect score!' : pct >= 80 ? 'Great job!' : pct >= 60 ? 'Good effort!' : 'Keep practicing!'

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 gap-6">
      <span style={{ fontSize: 80 }}>{emoji}</span>

      <div className="text-center">
        <h2 className="font-display font-extrabold text-4xl text-ink">{msg}</h2>
        <p className="text-muted font-body text-base mt-2">{topic}</p>
      </div>

      {/* Score circle */}
      <div className="w-32 h-32 rounded-full bg-green-50 border-4 border-duo flex flex-col items-center justify-center">
        <span className="font-display font-extrabold text-4xl text-duo">{correct}/{total}</span>
        <span className="font-body text-sm text-muted">{pct}%</span>
      </div>

      {/* Per-question recap */}
      <div className="w-full max-w-xs flex flex-col gap-2">
        {questions.map((q, i) => {
          const isCorrect = answers[i] === q.correct_answer
          return (
            <div key={i} className={`rounded-2xl px-4 py-3 border-2 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-100 bg-red-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span>{isCorrect ? '✅' : '❌'}</span>
                <p className="font-body text-sm text-ink font-semibold leading-tight">{q.question}</p>
              </div>
              {!isCorrect && (
                <p className="font-body text-xs text-duo font-bold ml-6">
                  Answer: {q.correct_answer}
                </p>
              )}
            </div>
          )
        })}
      </div>

      <button
        onClick={onDone}
        className="w-full max-w-xs bg-duo active:bg-duo-dark text-white font-display font-bold text-lg rounded-2xl py-5 shadow-[0_4px_0_#58a700] active:shadow-none active:translate-y-1 transition-all"
      >
        Done →
      </button>
    </div>
  )
}

// ── Main Quiz component ───────────────────────────────────────────

export default function Quiz({ exam, onDone }) {
  const questions = exam.questions || []
  const topic     = exam.topic || 'Quiz'

  const [idx,          setIdx]          = useState(0)
  const [selected,     setSelected]     = useState(null)
  const [revealed,     setRevealed]     = useState(false)
  const [answers,      setAnswers]      = useState([])
  const [showQuit,     setShowQuit]     = useState(false)
  const [showResults,  setShowResults]  = useState(false)
  const [typedValue,   setTypedValue]   = useState('')

  const q = questions[idx]
  if (!q) return null

  const total         = questions.length
  const progressScale = (idx + (revealed ? 1 : 0)) / Math.max(total, 1)

  // Check if the current answer is correct
  function checkCorrect(answer) {
    return answer?.trim().toLowerCase() === q.correct_answer?.trim().toLowerCase()
  }

  const isCorrect = revealed && checkCorrect(selected)

  function handleSelect(choice) {
    if (revealed) return
    setSelected(choice)
  }

  function handleCheck() {
    if (!selected && typedValue === '') return
    const answer = q.type === 'fill_blank' ? typedValue : selected
    setSelected(answer)
    setRevealed(true)
  }

  function handleContinue() {
    const answer = q.type === 'fill_blank' ? typedValue : selected
    const newAnswers = [...answers, answer]
    setAnswers(newAnswers)

    if (idx === total - 1) {
      setShowResults(true)
      return
    }

    setIdx(i => i + 1)
    setSelected(null)
    setRevealed(false)
    setTypedValue('')
  }

  if (showResults) {
    return (
      <ResultsScreen
        questions={questions}
        answers={answers}
        topic={topic}
        onDone={onDone}
      />
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <QuitPopup
        visible={showQuit}
        onStay={() => setShowQuit(false)}
        onLeave={onDone}
      />

      <div className="flex flex-col bg-white w-full max-w-sm" style={{ height: '100dvh' }}>

        {/* ── Top bar ─────────────────────────────────────── */}
        <div className="flex-shrink-0 flex items-center gap-3 px-4 pt-2 pb-1">
          <button
            onClick={() => setShowQuit(true)}
            className="w-11 h-11 flex items-center justify-center rounded-full text-gray-300 active:bg-gray-100"
          >
            <XIcon />
          </button>

          {/* Progress bar */}
          <div className="flex-1 h-5 rounded-full overflow-hidden bg-gray-100"
            role="progressbar" aria-valuenow={idx} aria-valuemax={total}>
            <div
              className="h-full rounded-full bg-duo origin-left"
              style={{
                transform: `scaleX(${progressScale})`,
                transition: 'transform 350ms cubic-bezier(0.4,0,0.2,1)',
              }}
            />
          </div>

          {/* Question counter */}
          <span className="font-display font-bold text-sm text-muted whitespace-nowrap">
            {idx + 1}/{total}
          </span>
        </div>

        {/* ── Topic label ─────────────────────────────────── */}
        <div className="flex-shrink-0 px-5 pt-2 pb-1">
          <p className="font-body font-bold text-xs tracking-widest uppercase text-duo">
            {topic}
          </p>
        </div>

        {/* ── Question ────────────────────────────────────── */}
        <div className="flex-shrink-0 px-6 pt-4 pb-3">
          <p className="font-display font-bold text-2xl text-ink leading-snug">
            {q.question}
          </p>
        </div>

        {/* ── Answer area ─────────────────────────────────── */}
        <div className="flex-shrink-0 px-4 mt-2 flex-1">
          {q.type === 'mcq' && (
            <div className="grid grid-cols-1 gap-3">
              {q.options.map(option => (
                <MCQCard
                  key={option}
                  option={option}
                  selected={selected}
                  revealed={revealed}
                  correct={q.correct_answer}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          )}

          {q.type === 'true_false' && (
            <div className="grid grid-cols-2 gap-3">
              {['True', 'False'].map(option => (
                <MCQCard
                  key={option}
                  option={option}
                  selected={selected}
                  revealed={revealed}
                  correct={q.correct_answer}
                  onSelect={handleSelect}
                  big
                />
              ))}
            </div>
          )}

          {q.type === 'fill_blank' && (
            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={typedValue}
                onChange={e => setTypedValue(e.target.value)}
                disabled={revealed}
                placeholder="Type your answer..."
                className={`w-full border-2 rounded-2xl px-4 py-4 font-display font-bold text-xl text-ink outline-none transition-colors ${
                  revealed
                    ? checkCorrect(typedValue)
                      ? 'border-green-400 bg-green-50'
                      : 'border-red-300 bg-red-50'
                    : 'border-gray-200 focus:border-duo'
                }`}
              />
              {revealed && !checkCorrect(typedValue) && (
                <p className="font-body text-sm text-duo font-bold px-1">
                  ✓ Correct answer: {q.correct_answer}
                </p>
              )}
            </div>
          )}

          {/* Explanation — shown after reveal */}
          {revealed && q.explanation && (
            <div className="mt-4 bg-blue-50 border-2 border-blue-100 rounded-2xl px-4 py-3">
              <p className="font-body text-sm text-blue-700 leading-snug">
                💡 {q.explanation}
              </p>
            </div>
          )}
        </div>

        {/* ── Bottom action ────────────────────────────────── */}
        <div className="flex-shrink-0 px-4 pt-2 pb-6">
          {!revealed ? (
            <button
              disabled={
                q.type === 'fill_blank'
                  ? typedValue.trim() === ''
                  : selected === null
              }
              onClick={handleCheck}
              className="w-full bg-duo active:bg-duo-dark disabled:opacity-40 text-white font-display font-bold text-xl rounded-2xl py-5 shadow-[0_4px_0_#58a700] active:shadow-none active:translate-y-1 transition-all tracking-widest"
            >
              CHECK
            </button>
          ) : (
            <div className={`rounded-2xl overflow-hidden border-2 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-100 bg-red-50'}`}>
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="text-2xl">{isCorrect ? '🎉' : '💪'}</span>
                <p className="font-display font-bold text-lg text-ink">
                  {isCorrect ? 'Correct!' : 'Not quite!'}
                </p>
              </div>
              <button
                onClick={handleContinue}
                className={`w-full py-4 font-display font-bold text-xl tracking-widest text-white ${isCorrect ? 'bg-duo' : 'bg-amber-400'}`}
              >
                CONTINUE →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── MCQ Card ──────────────────────────────────────────────────────

function MCQCard({ option, selected, revealed, correct, onSelect, big }) {
  const isSelected = selected === option
  const isCorrect  = option === correct

  let borderColor = 'border-gray-200'
  let bgColor     = 'bg-white'
  let textColor   = 'text-ink'

  if (revealed) {
    if (isCorrect) {
      borderColor = 'border-green-400'
      bgColor     = 'bg-green-50'
      textColor   = 'text-green-700'
    } else if (isSelected && !isCorrect) {
      borderColor = 'border-red-300'
      bgColor     = 'bg-red-50'
      textColor   = 'text-red-500'
    } else {
      borderColor = 'border-gray-100'
      textColor   = 'text-gray-300'
    }
  } else if (isSelected) {
    borderColor = 'border-blue-400'
    bgColor     = 'bg-blue-50'
    textColor   = 'text-blue-700'
  }

  return (
    <button
      disabled={revealed}
      onClick={() => onSelect(option)}
      className={`w-full rounded-2xl border-2 font-display font-bold transition-all active:scale-[0.97] select-none
        ${big ? 'text-3xl h-28 flex items-center justify-center' : 'text-lg px-5 py-4 text-left'}
        ${borderColor} ${bgColor} ${textColor}
      `}
    >
      {option}
    </button>
  )
}
