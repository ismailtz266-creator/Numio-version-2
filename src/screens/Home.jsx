import { useRef, useState } from 'react'
import { generateExam } from '../lib/generateExam'
import { saveExam } from '../lib/chapters'

export default function Home({ chapter, onExamReady, onBack }) {
  const fileInputRef = useRef(null)
  const [status, setStatus]   = useState('idle')
  const [error, setError]     = useState(null)
  const [preview, setPreview] = useState(null)
  const [inputKey, setInputKey] = useState(0) // forces input remount on each scan

  async function handleImageSelected(e) {
    const file = e.target.files[0]
    if (!file) return

    setPreview(URL.createObjectURL(file))
    setStatus('loading')
    setError(null)

    try {
      const exam = await generateExam(file)
      console.log('✅ Fresh exam from Claude:', exam.topic, exam.questions?.length, 'questions')
      onExamReady(exam)
      saveExam({
        chapterId: chapter.id,
        topic: exam.topic,
        questions: exam.questions,
      }).catch(err => console.error('Failed to save exam to DB:', err))
    } catch (err) {
      console.error('❌ Error:', err)
      setError(err.message)
      setStatus('error')
    }
  }

  function handleReset() {
    setStatus('idle')
    setError(null)
    setPreview(null)
    setInputKey(k => k + 1) // remount the input = fully cleared
  }

  function handleScanClick() {
    setInputKey(k => k + 1) // remount before every scan = no cache
    // Small timeout so the new input is in the DOM before we click it
    setTimeout(() => fileInputRef.current?.click(), 10)
  }

  return (
    <div className="bg-white flex flex-col" style={{ height: '100dvh' }}>
      <div className="w-full max-w-lg mx-auto px-5 flex flex-col flex-1">

        <button
          onClick={onBack}
          className="flex-shrink-0 text-muted font-body font-bold text-sm mt-12 mb-6 flex items-center gap-1 active:opacity-60 self-start"
        >
          ← Back
        </button>

        <div className="flex-shrink-0 text-center mb-8">
          <span style={{ fontSize: 52 }}>{chapter.emoji}</span>
          <h1 className="font-display font-extrabold text-3xl text-ink tracking-tight mt-2">
            {chapter.name}
          </h1>
          <p className="mt-2 text-muted font-body text-base">
            Snap your notes or textbook 📸
          </p>
        </div>

        {preview && (
          <div className="flex-shrink-0 mb-6 w-full rounded-2xl overflow-hidden border-2 border-gray-100 shadow-sm max-h-64">
            <img src={preview} alt="Selected" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex-1 flex flex-col items-center justify-center gap-4 pb-10">
          {status === 'idle' && (
            <button
              onClick={handleScanClick}
              className="w-full bg-duo active:bg-duo-dark hover:bg-duo-dark text-white font-display font-bold text-lg rounded-2xl py-5 shadow-[0_4px_0_#58a700] active:shadow-none active:translate-y-1 transition-all"
            >
              📸 Take Photo or Select
            </button>
          )}

          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-full border-4 border-gray-100 border-t-duo animate-spin" />
              <p className="font-display font-bold text-lg text-ink">Generating your quiz...</p>
              <p className="text-muted text-sm">Claude is reading the image ✨</p>
            </div>
          )}

          {status === 'error' && (
            <div className="w-full flex flex-col gap-4">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
                <p className="font-display font-bold text-xl text-duo-red">Something went wrong</p>
                <p className="text-xs text-muted mt-2 font-mono break-all">{error}</p>
              </div>
              <button
                onClick={handleReset}
                className="w-full bg-duo active:bg-duo-dark text-white font-display font-bold text-lg rounded-2xl py-4 shadow-[0_4px_0_#58a700] active:shadow-none active:translate-y-1 transition-all"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Key forces full remount every scan — kills any browser file cache */}
      <input
        key={inputKey}
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageSelected}
      />
    </div>
  )
}
