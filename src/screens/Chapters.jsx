import { useState, useEffect } from 'react'
import { getChapters, createChapter } from '../lib/chapters'

// 4 mascot variants — stored as '1','2','3','4' in the emoji column
const MASCOTS = [
  { id: '1', src: '/mascot-chapter1.png', label: 'Peeking' },
  { id: '2', src: '/mascot-chapter2.png', label: 'Curious' },
  { id: '3', src: '/mascot-chapter3.png', label: 'Growing' },
  { id: '4', src: '/mascot-chapter4.png', label: 'Standing' },
]

// Per-chapter banner colors — cycles if more than 8 chapters
const BANNER_COLORS = [
  { bg: '#e0f2fe', border: '#7dd3fc' }, // sky
  { bg: '#fce7f3', border: '#f9a8d4' }, // pink
  { bg: '#dcfce7', border: '#86efac' }, // green
  { bg: '#fef9c3', border: '#fde047' }, // yellow
  { bg: '#ede9fe', border: '#c4b5fd' }, // purple
  { bg: '#ffedd5', border: '#fdba74' }, // orange
  { bg: '#ccfbf1', border: '#5eead4' }, // teal
  { bg: '#fee2e2', border: '#fca5a5' }, // red
]

function getMascotSrc(emojiField) {
  const found = MASCOTS.find(m => m.id === emojiField)
  return found ? found.src : '/mascot-chapter1.png'
}

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

  async function handleCreate(name, mascotId) {
    try {
      const chapter = await createChapter({ name, emoji: mascotId })
      setChapters(prev => [...prev, chapter])
      setShowModal(false)
    } catch (err) {
      console.error('Failed to create chapter:', err)
    }
  }

  if (loading) return <LoadingScreen />

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ height: '100dvh' }}>
      <div className="flex-1 overflow-y-auto px-5 pt-12 pb-10">
        <div className="max-w-2xl mx-auto">
          {chapters.length === 0 ? (
            <EmptyState onAdd={() => setShowModal(true)} />
          ) : (
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
  const mascotSrc = getMascotSrc(chapter.emoji)

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-3xl bg-white overflow-hidden transition-all active:translate-y-1"
      style={{
        border: `2px solid ${color.border}`,
        boxShadow: `0 4px 0 ${color.border}`,
      }}
    >
      {/* Banner */}
      <div
        className="relative overflow-hidden"
        style={{ background: color.bg, height: 140 }}
      >
        {/* Chapter name overlaid on the bubble that's part of the mascot image */}
        <span style={{
          position: 'absolute',
          top: 22,
          right: 24,
          fontFamily: '"Baloo 2", sans-serif',
          fontWeight: 800,
          fontSize: 15,
          color: '#3c3c3c',
          zIndex: 2,
          maxWidth: '55%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {chapter.name}
        </span>

        {/* Mascot — big, bottom-right, partially cut off */}
        <img
          src={mascotSrc}
          alt="Numio mascot"
          style={{
            position: 'absolute',
            bottom: -12,
            right: -8,
            height: 130,
            width: 'auto',
            objectFit: 'contain',
            zIndex: 1,
          }}
        />
      </div>

      {/* Card body */}
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
      <img src="/mascot-chapter4.png" alt="Numio" className="w-32 h-auto" />
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
  const [name, setName]       = useState('')
  const [mascotId, setMascotId] = useState('1')
  const [saving, setSaving]   = useState(false)

  async function handleSubmit() {
    if (!name.trim()) return
    setSaving(true)
    await onConfirm(name.trim(), mascotId)
    setSaving(false)
  }

  return (
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

          {/* Mascot picker */}
          <div className="flex flex-col gap-3">
            <label className="font-body font-bold text-xs text-muted uppercase tracking-widest">
              Pick your mascot
            </label>
            <div className="grid grid-cols-4 gap-3">
              {MASCOTS.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMascotId(m.id)}
                  className={`flex flex-col items-center justify-end rounded-2xl border-2 transition-all overflow-hidden pt-2`}
                  style={{
                    height: 90,
                    borderColor: mascotId === m.id ? '#58cc02' : '#e5e7eb',
                    background: mascotId === m.id ? '#f0fdf4' : '#f9fafb',
                  }}
                >
                  <img
                    src={m.src}
                    alt={m.label}
                    style={{ height: 70, width: 'auto', objectFit: 'contain' }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div
            className="relative rounded-2xl overflow-hidden flex items-end"
            style={{ height: 100, background: '#e0f2fe' }}
          >
            <span style={{
              position: 'absolute',
              top: 14,
              left: 18,
              fontFamily: '"Baloo 2", sans-serif',
              fontWeight: 800,
              fontSize: 14,
              color: '#3c3c3c',
              zIndex: 2,
            }}>
              {name || 'Chapter name...'}
            </span>
            <img
              src={getMascotSrc(mascotId)}
              alt=""
              style={{
                position: 'absolute',
                bottom: -8,
                right: -4,
                height: 90,
                width: 'auto',
                objectFit: 'contain',
              }}
            />
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
