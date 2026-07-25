import { useState, useEffect } from 'react'
import { getChapters, createChapter } from '../lib/chapters'

const EMOJI_OPTIONS = [
  '📐','📖','🔬','🌍','🎨','🎵','🏃','💻','🧮','📝',
  '🦋','🌿','⚗️','🗺️','🎭','📚','🧠','🔭','🏛️','✏️',
  '🧪','🌊','🦁','🎯','🧩','🌸','⚽','🎸','🍎','🚀',
]

// Per-chapter banner colors — cycles through if more than 8 chapters
const BANNER_COLORS = [
  { bg: '#e0f2fe', border: '#bae6fd' }, // sky
  { bg: '#fce7f3', border: '#fbcfe8' }, // pink
  { bg: '#dcfce7', border: '#bbf7d0' }, // green
  { bg: '#fef9c3', border: '#fef08a' }, // yellow
  { bg: '#ede9fe', border: '#ddd6fe' }, // purple
  { bg: '#ffedd5', border: '#fed7aa' }, // orange
  { bg: '#ccfbf1', border: '#99f6e4' }, // teal
  { bg: '#fee2e2', border: '#fecaca' }, // red
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

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 pt-12 pb-10">
        <div className="max-w-2xl mx-auto">
          {chapters.length === 0 ? (
            <EmptyState onAdd={() => setShowModal(true)} />
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chapters.map((chapter, index) => (
                  <ChapterCard
                    key={chapter.id}
                    chapter={chapter}
                    colorIndex={index}
                    onClick={() => onSelectChapter(chapter)}
                  />
                ))}
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-200 text-muted font-display font-bold text-base active:bg-gray-50 hover:bg-gray-50 transition-colors"
              >
                + Add chapter
              </button>
            </div>
          )}
        </div>
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

function ChapterCard({ chapter, colorIndex, onClick }) {
  const color = BANNER_COLORS[colorIndex % BANNER_COLORS.length]
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-3xl bg-white overflow-hidden transition-all active:translate-y-1"
      style={{
        border: `2px solid ${color.border}`,
        boxShadow: `0 4px 0 ${color.border}`,
      }}
    >
      {/* Banner: mascot + speech bubble */}
      <div
        className="relative h-28 flex items-end justify-center overflow-hidden"
        style={{ background: color.bg }}
      >
        {/* Speech bubble */}
        <div style={{
          position: 'absolute',
          top: 12,
          left: 16,
          background: 'white',
          borderRadius: 14,
          padding: '6px 12px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          maxWidth: '65%',
        }}>
          <span style={{
            fontFamily: '"Baloo 2", sans-serif',
            fontWeight: 800,
            fontSize: 13,
            color: '#3c3c3c',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'block',
            maxWidth: 120,
          }}>
            {chapter.name}
          </span>
          {/* Bubble tail */}
          <div style={{
            position: 'absolute',
            bottom: -7,
            left: 16,
            width: 0,
            height: 0,
            borderLeft: '7px solid transparent',
            borderRight: '7px solid transparent',
            borderTop: '8px solid white',
          }} />
        </div>

        {/* Mascot */}
        <img
          src="/mascot.png"
          alt="Numio"
          style={{
            height: 80,
            width: 'auto',
            objectFit: 'contain',
            position: 'relative',
            zIndex: 1,
          }}
        />
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
