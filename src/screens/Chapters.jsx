import { useState, useEffect } from 'react'
import { getChapters, createChapter } from '../lib/chapters'

const EMOJI_OPTIONS = [
  '📐','📖','🔬','🌍','🎨','🎵','🏃','💻','🧮','📝',
  '🦋','🌿','⚗️','🗺️','🎭','📚','🧠','🔭','🏛️','✏️',
  '🧪','🌊','🦁','🎯','🧩','🌸','⚽','🎸','🍎','🚀',
]

export default function Chapters({ onSelectChapter }) {
  const [chapters, setChapters]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => { loadChapters() }, [])

  async function loadChapters() {
    try {
      const data = await getChapters()
      setChapters(data)
    } catch (err) {
      console.error('Failed to load chapters:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(name, emoji) {
    try {
      const chapter = await createChapter({ name, emoji })
      setChapters(prev => [...prev, chapter])
      setShowModal(false)
    } catch (err) {
      console.error('Failed to create chapter:', err)
    }
  }

  if (loading) return <LoadingScreen />

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ height: '100dvh' }}>

      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-12 pb-4">
        <h1 className="font-display font-extrabold text-3xl text-ink">My Chapters</h1>
        <p className="text-muted font-body text-sm mt-1">Pick a subject to study 📚</p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 pb-10">
        {chapters.length === 0 ? (
          <EmptyState onAdd={() => setShowModal(true)} />
        ) : (
          <div className="flex flex-col gap-4">
            {chapters.map(chapter => (
              <ChapterCard
                key={chapter.id}
                chapter={chapter}
                onClick={() => onSelectChapter(chapter)}
              />
            ))}
            <button
              onClick={() => setShowModal(true)}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-200 text-muted font-display font-bold text-base active:bg-gray-50 transition-colors"
            >
              + Add more chapters
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <ChapterModal
          onConfirm={handleCreate}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

function ChapterCard({ chapter, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-3xl border-2 border-gray-100 bg-white shadow-sm active:scale-[0.98] transition-transform overflow-hidden"
    >
      <div className="h-24 bg-blue-50 flex items-center justify-center">
        <span style={{ fontSize: 52 }}>{chapter.emoji}</span>
      </div>
      <div className="px-5 py-4">
        <p className="font-display font-extrabold text-xl text-ink">{chapter.name}</p>
        <p className="font-body text-sm text-muted mt-0.5">Tap to study →</p>
      </div>
    </button>
  )
}

function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center pt-20 gap-6 text-center px-4">
      <span style={{ fontSize: 72 }}>📭</span>
      <div>
        <p className="font-display font-extrabold text-2xl text-ink">No chapters yet</p>
        <p className="text-muted font-body text-base mt-2">
          Create your first chapter to start learning!
        </p>
      </div>
      <button
        onClick={onAdd}
        className="w-full max-w-xs bg-duo active:bg-duo-dark text-white font-display font-bold text-lg rounded-2xl py-5 shadow-[0_4px_0_#58a700] active:shadow-none active:translate-y-1 transition-all"
      >
        Set up my first chapter
      </button>
    </div>
  )
}

function ChapterModal({ onConfirm, onClose }) {
  const [name, setName]     = useState('')
  const [emoji, setEmoji]   = useState('📐')
  const [saving, setSaving] = useState(false)

  async function handleSubmit() {
    if (!name.trim()) return
    setSaving(true)
    await onConfirm(name.trim(), emoji)
    setSaving(false)
  }

  return (
    // Full screen overlay — scrollable sheet, works with keyboard
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-end"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full bg-white rounded-t-3xl flex flex-col"
        style={{ maxHeight: '90dvh' }}
      >
        {/* Handle */}
        <div className="flex-shrink-0 pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Scrollable inner */}
        <div className="flex-1 overflow-y-auto px-5 pb-8 flex flex-col gap-5">
          <h2 className="font-display font-extrabold text-2xl text-ink text-center pt-2">
            New Chapter
          </h2>

          {/* Name */}
          <div className="flex flex-col gap-2">
            <label className="font-body font-bold text-xs text-muted uppercase tracking-widest">
              Chapter name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Math, French, Science..."
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 font-display font-bold text-lg text-ink outline-none focus:border-duo transition-colors"
            />
          </div>

          {/* Emoji picker */}
          <div className="flex flex-col gap-2">
            <label className="font-body font-bold text-xs text-muted uppercase tracking-widest">
              Pick an icon
            </label>
            <div className="grid grid-cols-6 gap-2">
              {EMOJI_OPTIONS.map(e => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`h-11 w-full rounded-xl text-xl flex items-center justify-center border-2 transition-all ${
                    emoji === e
                      ? 'border-duo bg-green-50'
                      : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3">
            <span style={{ fontSize: 28 }}>{emoji}</span>
            <span className="font-display font-bold text-lg text-ink">
              {name || 'Chapter name...'}
            </span>
          </div>

          {/* CTA */}
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || saving}
            className="w-full bg-duo active:bg-duo-dark disabled:opacity-40 text-white font-display font-bold text-lg rounded-2xl py-4 shadow-[0_4px_0_#58a700] active:shadow-none active:translate-y-1 transition-all"
          >
            {saving ? 'Creating...' : 'Create Chapter →'}
          </button>

          <button
            onClick={onClose}
            className="w-full text-muted font-body font-bold text-sm py-2 text-center"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-4 border-gray-100 border-t-duo animate-spin" />
    </div>
  )
}
