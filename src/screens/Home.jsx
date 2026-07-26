import { useRef, useState } from 'react'
import { generateExam } from '../lib/generateExam'
import { saveExam } from '../lib/chapters'
import { useLang } from '../lib/LangContext'
import { t } from '../lib/i18n'

export default function Home({ chapter, onExamReady, onBack }) {
  const lang = useLang()
  const fileInputRef = useRef(null)
  const [status, setStatus]   = useState('idle')
  const [error, setError]     = useState(null)
  const [preview, setPreview] = useState(null)
  const [inputKey, setInputKey] = useState(0)

  async function handleImageSelected(e) {
    const file = e.target.files[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setStatus('loading')
    setError(null)
    try {
      const exam = await generateExam(file)
      onExamReady(exam)
      saveExam({ chapterId: chapter.id, topic: exam.topic, questions: exam.questions })
        .catch(err => console.error('Failed to save exam:', err))
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  function handleReset() {
    setStatus('idle')
    setError(null)
    setPreview(null)
    setInputKey(k => k + 1)
  }

  function handleScanClick() {
    setInputKey(k => k + 1)
    setTimeout(() => fileInputRef.current?.click(), 10)
  }

  return (
    <div className="bg-white flex flex-col" style={{ height: '100dvh' }}>
      <div className="w-full max-w-lg mx-auto px-5 flex flex-col flex-1">
        <button
          onClick={onBack}
          className="flex-shrink-0 text-muted font-body font-bold text-sm mt-12 mb-6 flex items-center gap-1 active:opacity-60 self-start"
        >
          {t(lang, 'home_back')}
        </button>

        <div className="flex-shrink-0 text-center mb-8">
          <span style={{ fontSize: 52 }}>{chapter.emoji}</span>
          <h1 className="font-display font-extrabold text-3xl text-ink tracking-tight mt-2">{chapter.name}</h1>
          <p className="mt-2 text-muted font-body text-base">{t(lang, 'home_snap')}</p>
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
              className="w-full bg-duo text-white font-display font-bold text-lg rounded-2xl py-5 transition-all active:translate-y-1"
              style={{ boxShadow: '0 4px 0 #46a302' }}
            >
              {t(lang, 'home_cta')}
            </button>
          )}
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-full border-4 border-gray-100 border-t-duo animate-spin" />
              <p className="font-display font-bold text-lg text-ink">{t(lang, 'home_generating')}</p>
              <p className="text-muted text-sm">{t(lang, 'home_reading')}</p>
            </div>
          )}
          {status === 'error' && (
            <div className="w-full flex flex-col gap-4">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
                <p className="font-display font-bold text-xl text-duo-red">{t(lang, 'home_error_title')}</p>
                <p className="text-xs text-muted mt-2 font-mono break-all">{error}</p>
              </div>
              <button
                onClick={handleReset}
                className="w-full bg-duo text-white font-display font-bold text-lg rounded-2xl py-4 transition-all active:translate-y-1"
                style={{ boxShadow: '0 4px 0 #46a302' }}
              >
                {t(lang, 'home_try_again')}
              </button>
            </div>
          )}
        </div>
      </div>
      <input key={inputKey} ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelected} />
    </div>
  )
}
