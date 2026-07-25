import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

// ── Steps ─────────────────────────────────────────────────────────
// welcome → language → goal → account → name → how_it_works
const TOTAL_QUESTIONS = 3 // language + goal + account (name & how excluded from bar)

// ── Small helpers ─────────────────────────────────────────────────
function ProgressBar({ step }) {
  // step 1 = language, 2 = goal, 3 = account
  const pct = (step / TOTAL_QUESTIONS) * 100
  return (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-duo rounded-full transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function OptionCard({ label, icon, selected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 font-display font-bold text-lg text-left transition-all active:scale-[0.98] ${
        selected
          ? 'border-duo bg-green-50 text-duo'
          : 'border-gray-200 bg-white text-ink'
      }`}
    >
      <span style={{ fontSize: 28 }}>{icon}</span>
      {label}
    </button>
  )
}

// ── Main Onboarding ───────────────────────────────────────────────
export default function Onboarding({ onComplete }) {
  const [screen, setScreen] = useState('welcome') // welcome|language|goal|account|graffiti|name|how
  const [mascotSmall, setMascotSmall] = useState(false)

  // Answers
  const [language, setLanguage] = useState(null)
  const [goal, setGoal]         = useState(null)

  // Account
  const [phone, setPhone]       = useState('')
  const [pin, setPin]           = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [authError, setAuthError]   = useState('')
  const [loading, setLoading]       = useState(false)

  // Name
  const [name, setName]         = useState('')

  function handleStart() {
    setMascotSmall(true)
    setTimeout(() => setScreen('language'), 600)
  }

  function goTo(next) {
    setScreen(next)
  }

  async function handleCreateAccount() {
    if (pin !== confirmPin) { setAuthError('PINs do not match'); return }
    if (pin.length !== 4)   { setAuthError('PIN must be 4 digits'); return }
    if (phone.length < 8)   { setAuthError('Enter a valid phone number'); return }

    setLoading(true)
    setAuthError('')

    try {
      // Use phone as email trick: phone@numio.app
      const fakeEmail = `${phone.replace(/\s+/g, '')}@numio.app`
      const { error } = await supabase.auth.signUp({
        email: fakeEmail,
        password: pin + pin.slice(0, 2), // pad to 6 chars — Supabase minimum
      })
      if (error) throw error
      setScreen('graffiti')
    } catch (e) {
      setAuthError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveName() {
    if (!name.trim()) return
    // Save name to profile
    try {
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('profiles').upsert({
        id: user.id,
        display_name: name.trim(),
        coin_balance: 0,
        streak_count: 0,
      })
    } catch (e) { console.error(e) }
    setScreen('how')
  }

  // Graffiti auto-advance after 3s
  useEffect(() => {
    if (screen !== 'graffiti') return
    const t = setTimeout(() => setScreen('name'), 3000)
    return () => clearTimeout(t)
  }, [screen])

  // ── Screens ───────────────────────────────────────────────────

  if (screen === 'welcome') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 gap-8" style={{ height: '100dvh' }}>
        <div
          className="transition-all duration-500"
          style={{
            transform: mascotSmall ? 'scale(0.4) translateY(-120px)' : 'scale(1)',
            opacity: mascotSmall ? 0 : 1,
          }}
        >
          <img src="/mascot.png" alt="Numio" className="w-52 h-auto" />
        </div>

        <div className="text-center" style={{ opacity: mascotSmall ? 0 : 1, transition: 'opacity 0.3s' }}>
          <h1 className="font-display font-extrabold text-4xl text-ink">Welcome to Numio!</h1>
          <p className="font-body text-base text-muted mt-2">Snap. Learn. Earn rewards. 📸</p>
        </div>

        <button
          onClick={handleStart}
          className="w-full max-w-xs bg-duo text-white font-display font-bold text-xl rounded-2xl py-5 shadow-[0_4px_0_#58a700] active:shadow-none active:translate-y-1 transition-all"
          style={{ opacity: mascotSmall ? 0 : 1, transition: 'opacity 0.3s' }}
        >
          Let's start →
        </button>
      </div>
    )
  }

  if (screen === 'language') {
    return (
      <QuestionScreen
        step={1}
        mascot
        question="What language do you prefer?"
        options={[
          { label: 'English', icon: '🇬🇧', value: 'en' },
          { label: 'العربية', icon: '🇸🇦', value: 'ar' },
        ]}
        selected={language}
        onSelect={setLanguage}
        onNext={() => goTo('goal')}
      />
    )
  }

  if (screen === 'goal') {
    return (
      <QuestionScreen
        step={2}
        mascot
        question={language === 'ar' ? 'لماذا تريد استخدام Numio؟' : 'Why do you want to use Numio?'}
        options={[
          { label: language === 'ar' ? 'أتحسن في المدرسة' : 'Get better at school', icon: '📈', value: 'improve' },
          { label: language === 'ar' ? 'أستعد لامتحان قادم' : 'Prepare for an exam', icon: '📝', value: 'exam' },
          { label: language === 'ar' ? 'أراجع دروسي' : 'Review my lessons', icon: '🔄', value: 'review' },
          { label: language === 'ar' ? 'مجرد فضول!' : 'Just curious!', icon: '✨', value: 'curious' },
        ]}
        selected={goal}
        onSelect={setGoal}
        onNext={() => goTo('account')}
      />
    )
  }

  if (screen === 'account') {
    return (
      <div className="min-h-screen bg-white flex flex-col px-5" style={{ height: '100dvh' }}>
        <div className="flex-shrink-0 pt-12 pb-4">
          <ProgressBar step={3} />
        </div>

        {/* Mascot small at top */}
        <div className="flex-shrink-0 flex items-center gap-3 mb-6">
          <img src="/mascot.png" alt="" className="w-12 h-12 object-contain" />
          <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3">
            <p className="font-display font-bold text-base text-ink">Create your family account!</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pb-10">
          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label className="font-body font-bold text-xs text-muted uppercase tracking-widest">Phone number</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+1 234 567 8900"
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 font-display font-bold text-xl text-ink outline-none focus:border-duo transition-colors"
            />
          </div>

          {/* PIN */}
          <div className="flex flex-col gap-1.5">
            <label className="font-body font-bold text-xs text-muted uppercase tracking-widest">4-digit PIN</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="••••"
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 font-display font-bold text-3xl text-ink outline-none focus:border-duo transition-colors tracking-[1rem]"
            />
          </div>

          {/* Confirm PIN */}
          <div className="flex flex-col gap-1.5">
            <label className="font-body font-bold text-xs text-muted uppercase tracking-widest">Confirm PIN</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={confirmPin}
              onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="••••"
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 font-display font-bold text-3xl text-ink outline-none focus:border-duo transition-colors tracking-[1rem]"
            />
          </div>

          {authError && (
            <p className="font-body text-sm text-red-500 font-bold text-center">{authError}</p>
          )}

          <button
            onClick={handleCreateAccount}
            disabled={loading || !phone || pin.length !== 4 || confirmPin.length !== 4}
            className="w-full bg-duo disabled:opacity-40 text-white font-display font-bold text-xl rounded-2xl py-5 shadow-[0_4px_0_#58a700] active:shadow-none active:translate-y-1 transition-all mt-2"
          >
            {loading ? 'Creating...' : 'Create Account →'}
          </button>
        </div>
      </div>
    )
  }

  if (screen === 'graffiti') {
    return (
      <div className="min-h-screen bg-duo flex flex-col items-center justify-center px-6 gap-6" style={{ height: '100dvh' }}>
        <div style={{ animation: 'pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}>
          <img src="/mascot.png" alt="Numio" className="w-40 h-auto" />
        </div>
        <div className="text-center" style={{ animation: 'pop-in 0.5s 0.15s cubic-bezier(0.34,1.56,0.64,1) both' }}>
          <h1 className="font-display font-extrabold text-5xl text-white">Welcome! 🎉</h1>
          <p className="font-body text-lg text-white/80 mt-2">Your account is ready!</p>
        </div>
        <style>{`
          @keyframes pop-in {
            from { opacity: 0; transform: scale(0.5); }
            to   { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    )
  }

  if (screen === 'name') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 gap-8" style={{ height: '100dvh' }}>
        {/* Mascot + bubble */}
        <div className="flex items-start gap-3 w-full max-w-sm">
          <img src="/mascot.png" alt="" className="w-16 h-16 object-contain flex-shrink-0" />
          <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3">
            <p className="font-display font-bold text-lg text-ink">What's your name? 😊</p>
          </div>
        </div>

        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Enter your name..."
          className="w-full max-w-sm border-2 border-gray-200 rounded-2xl px-4 py-4 font-display font-bold text-2xl text-ink outline-none focus:border-duo transition-colors text-center"
          autoFocus
        />

        <button
          onClick={handleSaveName}
          disabled={!name.trim()}
          className="w-full max-w-sm bg-duo disabled:opacity-40 text-white font-display font-bold text-xl rounded-2xl py-5 shadow-[0_4px_0_#58a700] active:shadow-none active:translate-y-1 transition-all"
        >
          That's me! →
        </button>
      </div>
    )
  }

  if (screen === 'how') {
    const steps = [
      { icon: '📸', title: 'Take a picture', desc: 'Snap any textbook page or notes.' },
      { icon: '🧠', title: 'Practice', desc: 'Answer a quiz Claude built just for you.' },
      { icon: '🎁', title: 'Earn & claim rewards', desc: 'Collect coins and claim rewards set by your parents.' },
    ]
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 gap-8" style={{ height: '100dvh' }}>
        <div className="text-center">
          <img src="/mascot.png" alt="" className="w-24 h-auto mx-auto mb-4" />
          <h1 className="font-display font-extrabold text-3xl text-ink">Here's how it works</h1>
          <p className="font-body text-base text-muted mt-1">3 simple steps to learning 🚀</p>
        </div>

        <div className="w-full max-w-sm flex flex-col gap-4">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-4 bg-gray-50 rounded-2xl px-5 py-4">
              <div className="w-12 h-12 rounded-2xl bg-white border-2 border-gray-100 flex items-center justify-center flex-shrink-0">
                <span style={{ fontSize: 28 }}>{s.icon}</span>
              </div>
              <div>
                <p className="font-display font-bold text-base text-ink">{s.title}</p>
                <p className="font-body text-sm text-muted">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onComplete}
          className="w-full max-w-sm bg-duo text-white font-display font-bold text-xl rounded-2xl py-5 shadow-[0_4px_0_#58a700] active:shadow-none active:translate-y-1 transition-all"
        >
          Let's go! 🚀
        </button>
      </div>
    )
  }

  return null
}

// ── Reusable question screen ──────────────────────────────────────
function QuestionScreen({ step, question, options, selected, onSelect, onNext }) {
  return (
    <div className="min-h-screen bg-white flex flex-col px-5" style={{ height: '100dvh' }}>
      <div className="flex-shrink-0 pt-12 pb-4">
        <ProgressBar step={step} />
      </div>

      {/* Mascot + bubble */}
      <div className="flex-shrink-0 flex items-start gap-3 mb-8">
        <img src="/mascot.png" alt="" className="w-14 h-14 object-contain flex-shrink-0" />
        <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 max-w-xs">
          <p className="font-display font-bold text-lg text-ink">{question}</p>
        </div>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-3 flex-1">
        {options.map(opt => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            icon={opt.icon}
            selected={selected === opt.value}
            onSelect={() => onSelect(opt.value)}
          />
        ))}
      </div>

      {/* Next */}
      <div className="flex-shrink-0 pb-8 pt-4">
        <button
          onClick={onNext}
          disabled={!selected}
          className="w-full bg-duo disabled:opacity-40 text-white font-display font-bold text-xl rounded-2xl py-5 shadow-[0_4px_0_#58a700] active:shadow-none active:translate-y-1 transition-all"
        >
          Continue →
        </button>
      </div>
    </div>
  )
}
