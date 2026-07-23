import { useEffect, useState } from 'react'
import { ensureAuth } from './lib/auth'
import Chapters from './screens/Chapters'
import CurrentChapter from './screens/CurrentChapter'
import Home from './screens/Home'
import Revision from './screens/Revision'
import Quiz from './screens/Quiz'

/*
  Navigation state machine:
  'chapters'        → Chapters list (home)
  'current_chapter' → New / Revision buttons for a chapter
  'scan'            → Camera screen (New flow)
  'quiz'            → Active quiz
  'revision'        → List of past exams
*/

export default function App() {
  const [authReady, setAuthReady]       = useState(false)
  const [screen, setScreen]             = useState('chapters')
  const [activeChapter, setActiveChapter] = useState(null)
  const [activeExam, setActiveExam]     = useState(null)
  const [revisionExams, setRevisionExams] = useState([])

  // Ensure anonymous auth session on first load
  useEffect(() => {
    ensureAuth().finally(() => setAuthReady(true))
  }, [])

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-gray-100 border-t-duo animate-spin" />
      </div>
    )
  }

  // ── Handlers ──────────────────────────────────────────────────

  function goToChapter(chapter) {
    setActiveChapter(chapter)
    setScreen('current_chapter')
  }

  function goToScan(chapter) {
    setActiveChapter(chapter)
    setScreen('scan')
  }

  function goToRevision(chapter, exams) {
    setActiveChapter(chapter)
    setRevisionExams(exams)
    setScreen('revision')
  }

  function goToQuiz(exam) {
    setActiveExam(exam)
    setScreen('quiz')
  }

  function goBack() {
    if (screen === 'quiz')            return setScreen('revision')
    if (screen === 'revision')        return setScreen('current_chapter')
    if (screen === 'scan')            return setScreen('current_chapter')
    if (screen === 'current_chapter') return setScreen('chapters')
    setScreen('chapters')
  }

  function handleExamReady(exam) {
    // Exam generated & saved — go straight to quiz
    setActiveExam(exam)
    setScreen('quiz')
  }

  function handleQuizDone() {
    // After quiz, go back to chapter
    setScreen('current_chapter')
  }

  // ── Render ────────────────────────────────────────────────────

  if (screen === 'chapters') {
    return <Chapters onSelectChapter={goToChapter} />
  }

  if (screen === 'current_chapter') {
    return (
      <CurrentChapter
        chapter={activeChapter}
        onNew={goToScan}
        onRevision={goToRevision}
        onBack={() => setScreen('chapters')}
      />
    )
  }

  if (screen === 'scan') {
    return (
      <Home
        chapter={activeChapter}
        onExamReady={handleExamReady}
        onBack={() => setScreen('current_chapter')}
      />
    )
  }

  if (screen === 'revision') {
    return (
      <Revision
        chapter={activeChapter}
        exams={revisionExams}
        onSelectExam={goToQuiz}
        onBack={() => setScreen('current_chapter')}
      />
    )
  }

  if (screen === 'quiz') {
    return (
      <Quiz
        exam={activeExam}
        onDone={handleQuizDone}
      />
    )
  }

  return null
}
