import { useRef, useState } from 'react'
import { generateExam } from '../lib/generateExam'

export default function Home() {
  const fileInputRef = useRef(null)
  const [status, setStatus] = useState('idle') // 'idle' | 'loading' | 'done' | 'error'
  const [exam, setExam] = useState(null)
  const [error, setError] = useState(null)
  const [preview, setPreview] = useState(null)

  async function handleImageSelected(e) {
    const file = e.target.files[0]
    if (!file) return

    // Show image preview
    setPreview(URL.createObjectURL(file))
    setStatus('loading')
    setExam(null)
    setError(null)

    try {
      const result = await generateExam(file)
      setExam(result)
      setStatus('done')
      console.log('✅ Exam generated:', result)
    } catch (err) {
      console.error('❌ Error:', err)
      setError(err.message)
      setStatus('error')
    }
  }

  function handleReset() {
    setStatus('idle')
    setExam(null)
    setError(null)
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">

      {/* Logo / Title */}
      <div className="mb-10 text-center">
        <h1 className="font-display font-extrabold text-4xl text-ink tracking-tight">
          Numio <span className="text-duo">Scan</span>
        </h1>
        <p className="mt-2 text-muted font-body text-base">
          Snap anything. Get a quiz. 📸
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
        <ScanButton onClick={() => fileInputRef.current?.click()} />
      )}

      {status === 'loading' && (
        <LoadingState />
      )}

      {status === 'done' && exam && (
        <DoneState exam={exam} onReset={handleReset} />
      )}

      {status === 'error' && (
        <ErrorState message={error} onReset={handleReset} />
      )}

      {/* Hidden file input — accepts camera + gallery */}
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

// ─── Sub-components ───────────────────────────────────────────────

function ScanButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full max-w-xs bg-duo active:bg-duo-dark text-white font-display font-bold text-lg rounded-2xl py-5 shadow-[0_4px_0_#58a700] active:shadow-none active:translate-y-1 transition-all"
    >
      📸 Take Photo or Select
    </button>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-14 h-14 rounded-full border-4 border-gray-100 border-t-duo animate-spin" />
      <p className="font-display font-bold text-lg text-ink">
        Generating your quiz...
      </p>
      <p className="text-muted text-sm">Claude is reading the image ✨</p>
    </div>
  )
}

function DoneState({ exam, onReset }) {
  return (
    <div className="w-full max-w-xs flex flex-col gap-4">
      {/* Success banner */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
        <p className="font-display font-bold text-xl text-duo">🎉 Quiz Ready!</p>
        <p className="text-sm text-muted mt-1">{exam.topic || 'Your exam is generated'}</p>
      </div>

      {/* Raw JSON — temp debug output until exam UI is built */}
      <div className="bg-gray-50 rounded-xl p-4 max-h-72 overflow-y-auto">
        <p className="text-xs font-mono text-muted mb-2">DEBUG — raw exam JSON:</p>
        <pre className="text-xs text-ink whitespace-pre-wrap break-all">
          {JSON.stringify(exam, null, 2)}
        </pre>
      </div>

      <button
        onClick={onReset}
        className="w-full bg-duo active:bg-duo-dark text-white font-display font-bold text-lg rounded-2xl py-4 shadow-[0_4px_0_#58a700] active:shadow-none active:translate-y-1 transition-all"
      >
        Scan Another →
      </button>
    </div>
  )
}

function ErrorState({ message, onReset }) {
  return (
    <div className="w-full max-w-xs flex flex-col gap-4">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
        <p className="font-display font-bold text-xl text-duo-red">Something went wrong</p>
        <p className="text-xs text-muted mt-2 font-mono break-all">{message}</p>
      </div>
      <button
        onClick={onReset}
        className="w-full bg-duo active:bg-duo-dark text-white font-display font-bold text-lg rounded-2xl py-4 shadow-[0_4px_0_#58a700] active:shadow-none active:translate-y-1 transition-all"
      >
        Try Again
      </button>
    </div>
  )
}
