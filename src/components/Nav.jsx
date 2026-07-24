// Bottom bar on mobile, sidebar on desktop
// 3 tabs: Chapters, Rewards, Parent Zone
// Hidden during quiz and scan (full-screen flows)

import { BookOpen, Gift, Users } from 'lucide-react'

const TABS = [
  { id: 'chapters',    label: 'Chapters',    Icon: BookOpen },
  { id: 'rewards',     label: 'Rewards',     Icon: Gift     },
  { id: 'parent_zone', label: 'Parent Zone', Icon: Users    },
]

export default function Nav({ active, onChange }) {
  return (
    <>
      {/* ── Mobile bottom bar ─────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 flex"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors active:bg-gray-50"
            >
              <Icon
                size={24}
                strokeWidth={2.5}
                color={isActive ? '#58cc02' : '#AFAFAF'}
              />
              <span
                className="font-body font-bold text-xs"
                style={{ color: isActive ? '#58cc02' : '#AFAFAF' }}
              >
                {label}
              </span>
            </button>
          )
        })}
      </nav>

      {/* ── Desktop sidebar ───────────────────────────────── */}
      <aside className="hidden md:flex fixed top-0 left-0 bottom-0 w-56 bg-white border-r border-gray-100 flex-col py-8 px-4 z-40">
        {/* Logo */}
        <div className="mb-10 px-2">
          <span className="font-display font-extrabold text-2xl text-ink">
            Numio <span className="text-duo">Scan</span>
          </span>
        </div>

        {/* Nav items */}
        <div className="flex flex-col gap-1">
          {TABS.map(({ id, label, Icon }) => {
            const isActive = active === id
            return (
              <button
                key={id}
                onClick={() => onChange(id)}
                className={`flex items-center gap-3 px-3 py-3 rounded-2xl font-body font-bold text-sm transition-all text-left w-full ${
                  isActive ? 'bg-green-50 text-duo' : 'text-muted hover:bg-gray-50'
                }`}
              >
                <Icon size={20} strokeWidth={2.5} color={isActive ? '#58cc02' : '#AFAFAF'} />
                {label}
              </button>
            )
          })}
        </div>
      </aside>
    </>
  )
}
