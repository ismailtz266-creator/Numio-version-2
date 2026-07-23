import { useRef, useState } from 'react'
import { generateExam } from '../lib/generateExam'
import { saveExam } from '../lib/chapters'

export default function Home({ chapter, onExamReady, onBack }) {
  const fileInputRef = useRef(null)
  const [status, setStatus] = useState('idle') // 'idle' | 'loading' | 'error'
  const [error, setError]   = useState(null)
  const [preview, setPreview] = useState(null)

  async function handleImageSelected(e) {
    const file = e.target.files[0]
    if (!file) return

    setPreview(URL.createObjectURL(file))
    setStatus('loading')
    setError(null)

    try {
      const exam = await generateExam(file)

      // Save to DB under this chapter
      const saved = await saveExam({
        chapterId: chapter.id,
        topic: exam.topic,
        questions: exam.questions,
      })

      // Pass full exam object (with DB id) up to App
      onExamReady({ ...exam, id: saved.id })
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
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">

      {/* Back */}
      <button
        onClick={onBack}
        className="self-start text-muted font-body font-bold text-sm mb-8 flex items-center gap-1 active:opacity-60"
      >
        ← Back
      </button>

      {/* Header */}
      <div className="mb-10 text-center">
        <span style={{ fontSize: 48 }}>{chapter.emoji}</span>
        <h1 className="font-display font-extrabold text-3xl text-ink tracking-tight mt-2">
          {chapter.name}
        </h1>
        <p className="mt-2 text-muted font-body text-base">
          Snap your notes or textbook 📸
        </p>
      </div>

      {/* Image preview */}
      {preview && (
        <div className="mb-6 w-full max-w-xs rounded-2xl overflow-hidden border-2 border-gray-100 shadow-sm">
          <img src={preview} alt="Selected" className="w-full object-cover" />
        </div>
      )}

      {/* States */}
      {status === 'idle' && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full max-w-xs bg-duo active:bg-duo-dark text-white font-display font-bold text-lg rounded-2xl py-5 shadow-[0_4px_0_#58a700] active:shadow-none active:translate-y-1 transition-all"
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
        <div className="w-full max-w-xs flex flex-col gap-4">
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

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleImageSelected}
      />
    </div>
  )
}
