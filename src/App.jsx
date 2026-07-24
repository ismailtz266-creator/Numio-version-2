import { useEffect, useState } from 'react'
import { ensureAuth } from './lib/auth'
import Nav from './components/Nav'
import Chapters from './screens/Chapters'
import CurrentChapter from './screens/CurrentChapter'
import Home from './screens/Home'
import Revision from './screens/Revision'
import Quiz from './screens/Quiz'
import Rewards from './screens/Rewards'
import ParentZone from './screens/ParentZone'
import QuizIntro from './screens/QuizIntro'

const HIDE_NAV = ['quiz', 'scan', 'quiz_intro']

export default function App() {
  const [authReady, setAuthReady] = useState(false)
  const [tab, setTab]             = useState('chapters')

  // Single nav state object — screen + all associated data
  // Updating one object = one React render, no race conditions
  const [nav, setNav] = useState({
    screen:        'chapters',
    chapter:       null,
    exam:          null,
    revisionExams: [],
  })

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

  const { screen, chapter, exam, revisionExams } = nav

  function go(updates) {
    setNav(prev => ({ ...prev, ...updates }))
  }

  function handleTabChange(newTab) {
    setTab(newTab)
    go({ screen: newTab, chapter: null, exam: null, revisionExams: [] })
  }

  const showNav = !HIDE_NAV.includes(screen)

  return (
    <div className="flex">
      {showNav && <Nav active={tab} onChange={handleTabChange} />}

      <main
        className={`flex-1 ${showNav ? 'md:ml-56' : ''}`}
        style={{ paddingBottom: showNav ? 'calc(64px + env(safe-area-inset-bottom))' : 0 }}
      >
        {screen === 'chapters' && (
          <Chapters
            onSelectChapter={c => go({ screen: 'current_chapter', chapter: c })}
          />
        )}

        {screen === 'current_chapter' && (
          <CurrentChapter
            chapter={chapter}
            onNew={c => go({ screen: 'scan', chapter: c, exam: null })}
            onRevision={(c, exams) => go({ screen: 'revision', chapter: c, revisionExams: exams })}
            onBack={() => go({ screen: 'chapters' })}
          />
        )}

        {screen === 'scan' && (
          <Home
            chapter={chapter}
            onExamReady={freshExam => {
              console.log('✅ Navigating to quiz_intro with exam:', freshExam.topic)
              go({ screen: 'quiz_intro', exam: freshExam })
            }}
            onBack={() => go({ screen: 'current_chapter' })}
          />
        )}

        {screen === 'revision' && (
          <Revision
            chapter={chapter}
            exams={revisionExams}
            onSelectExam={e => go({ screen: 'quiz_intro', exam: e })}
            onBack={() => go({ screen: 'current_chapter' })}
          />
        )}

        {screen === 'quiz_intro' && exam && (
          <QuizIntro
            exam={exam}
            onStart={() => go({ screen: 'quiz' })}
          />
        )}

        {screen === 'quiz' && exam && (
          <Quiz
            exam={exam}
            onDone={() => go({ screen: 'current_chapter' })}
          />
        )}

        {screen === 'rewards'     && <Rewards />}
        {screen === 'parent_zone' && <ParentZone />}
      </main>
    </div>
  )
}
