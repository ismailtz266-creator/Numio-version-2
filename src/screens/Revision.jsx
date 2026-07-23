export default function Revision({ chapter, exams, onSelectExam, onBack }) {
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
        <h1 className="font-display font-extrabold text-3xl text-ink">Revision</h1>
        <p className="text-muted font-body text-sm mt-1">
          {chapter.emoji} {chapter.name} · {exams.length} exam{exams.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Exams list */}
      <div className="px-5 flex flex-col gap-3 pb-10">
        {exams.map((exam, i) => (
          <button
            key={exam.id}
            onClick={() => onSelectExam(exam)}
            className="w-full text-left bg-white border-2 border-gray-100 rounded-2xl px-5 py-4 active:bg-gray-50 transition-colors shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center font-display font-extrabold text-lg text-duo flex-shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-lg text-ink truncate">{exam.topic}</p>
                <p className="font-body text-sm text-muted">
                  {exam.questions?.length} questions ·{' '}
                  {new Date(exam.created_at).toLocaleDateString('en', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                </p>
              </div>
              <span className="text-muted text-xl">→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
