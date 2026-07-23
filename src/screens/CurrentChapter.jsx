import { useState, useEffect } from 'react'
import { getExamsForChapter, deleteExam } from '../lib/chapters'

export default function CurrentChapter({ chapter, onNew, onRevision, onBack }) {
  const [exams, setExams]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadExams()
  }, [chapter.id])

  async function loadExams() {
    try {
      const data = await getExamsForChapter(chapter.id)
      setExams(data)
    } catch (err) {
      console.error('Failed to load exams:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <button
          onClick={onBack}
          className="text-muted font-body font-bold text-sm mb-4 flex items-center gap-1 active:opacity-60"
        >
          ← Back
        </button>
        <div className="flex items-center gap-4">
          <span style={{ fontSize: 48 }}>{chapter.emoji}</span>
          <div>
            <h1 className="font-display font-extrabold text-3xl text-ink">{chapter.name}</h1>
            <p className="text-muted font-body text-sm">
              {loading ? '...' : `${exams.length} exam${exams.length !== 1 ? 's' : ''} saved`}
            </p>
          </div>
        </div>
      </div>

      {/* Two big buttons */}
      <div className="px-5 flex flex-col gap-4">
        {/* New — green */}
        <button
          onClick={() => onNew(chapter)}
          className="w-full bg-duo active:bg-duo-dark text-white font-display font-extrabold text-2xl rounded-3xl py-8 shadow-[0_5px_0_#58a700] active:shadow-none active:translate-y-1 transition-all flex flex-col items-center gap-1"
        >
          <span style={{ fontSize: 36 }}>📸</span>
          New
        </button>

        {/* Revision — grey */}
        <button
          onClick={() => onRevision(chapter, exams)}
          disabled={exams.length === 0}
          className="w-full bg-gray-100 active:bg-gray-200 disabled:opacity-40 text-gray-500 font-display font-extrabold text-2xl rounded-3xl py-8 shadow-[0_5px_0_#d1d5db] active:shadow-none active:translate-y-1 transition-all flex flex-col items-center gap-1 disabled:cursor-not-allowed"
        >
          <span style={{ fontSize: 36 }}>📋</span>
          Revision
          {exams.length === 0 && (
            <span className="font-body font-normal text-sm text-gray-400">
              No exams yet
            </span>
          )}
        </button>
      </div>

      {/* Recent exams preview */}
      {!loading && exams.length > 0 && (
        <div className="px-5 mt-8">
          <p className="font-body font-bold text-xs text-muted uppercase tracking-widest mb-3">
            Recent exams
          </p>
          <div className="flex flex-col gap-3">
            {exams.slice(0, 3).map(exam => (
              <ExamRow key={exam.id} exam={exam} />
            ))}
            {exams.length > 3 && (
              <p className="text-center text-muted font-body text-sm">
                +{exams.length - 3} more in Revision
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ExamRow({ exam }) {
  const date = new Date(exam.created_at).toLocaleDateString('en', {
    month: 'short', day: 'numeric'
  })
  return (
    <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3">
      <span style={{ fontSize: 24 }}>📝</span>
      <div className="flex-1 min-w-0">
        <p className="font-display font-bold text-base text-ink truncate">{exam.topic}</p>
        <p className="font-body text-xs text-muted">{exam.questions?.length} questions · {date}</p>
      </div>
    </div>
  )
}
