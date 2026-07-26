import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

const STRINGS = {
  en: {
    dir: 'ltr',
    welcome_title: 'Welcome to Numio!',
    welcome_sub: 'Snap. Learn. Earn rewards. 📸',
    welcome_cta: "Let's start →",
    lang_question: 'What language do you prefer?',
    goal_question: 'Why do you want to use Numio?',
    goal_options: [
      { label: 'Get better at school', icon: '📈', value: 'improve' },
      { label: 'Prepare for an exam', icon: '📝', value: 'exam' },
      { label: 'Review my lessons', icon: '🔄', value: 'review' },
      { label: 'Just curious!', icon: '✨', value: 'curious' },
    ],
    how_title: "Here's how it works",
    how_sub: '3 simple steps to learning 🚀',
    how_steps: [
      { icon: '📸', title: 'Take a picture', desc: 'Snap any textbook page or notes.' },
      { icon: '🧠', title: 'Practice', desc: 'Answer a quiz Claude built just for you.' },
      { icon: '🎁', title: 'Earn & claim rewards', desc: 'Collect coins and claim rewards set by your parents.' },
    ],
    how_cta: "Let's go! 🚀",
    account_bubble: 'Create your family account!',
    phone_label: 'Phone number',
    phone_placeholder: '+1 234 567 8900',
    pin_label: '4-digit PIN',
    confirm_pin_label: 'Confirm PIN',
    create_cta: 'Create Account →',
    creating: 'Creating...',
    error_pin_match: 'PINs do not match',
    error_pin_length: 'PIN must be 4 digits',
    error_phone: 'Enter a valid phone number',
    welcome_back: 'Welcome! 🎉',
    account_ready: 'Your account is ready!',
    name_question: "What's your name? 😊",
    name_placeholder: 'Enter your name...',
    name_cta: "That's me! →",
    continue: 'Continue →',
  },
  ar: {
    dir: 'rtl',
    welcome_title: '!مرحباً بك في Numio',
    welcome_sub: 'صوّر. تعلّم. اكسب مكافآت. 📸',
    welcome_cta: 'هيا نبدأ ←',
    lang_question: 'ما اللغة التي تفضلها؟',
    goal_question: 'لماذا تريد استخدام Numio؟',
    goal_options: [
      { label: 'أتحسن في المدرسة', icon: '📈', value: 'improve' },
      { label: 'أستعد لامتحان قادم', icon: '📝', value: 'exam' },
      { label: 'أراجع دروسي', icon: '🔄', value: 'review' },
      { label: 'مجرد فضول!', icon: '✨', value: 'curious' },
    ],
    how_title: 'كيف يعمل التطبيق',
    how_sub: '٣ خطوات بسيطة للتعلم 🚀',
    how_steps: [
      { icon: '📸', title: 'التقط صورة', desc: 'صوّر أي صفحة من كتابك أو ملاحظاتك.' },
      { icon: '🧠', title: 'تدرّب', desc: 'أجب على اختبار أعدّه كلود خصيصاً لك.' },
      { icon: '🎁', title: 'اكسب واستبدل المكافآت', desc: 'اجمع العملات واستبدلها بمكافآت حددها والداك.' },
    ],
    how_cta: 'هيا بنا! 🚀',
    account_bubble: '!أنشئ حساب عائلتك',
    phone_label: 'رقم الهاتف',
    phone_placeholder: '٩٦٦ ٥٠٠ ٠٠٠ ٠٠٠+',
    pin_label: 'رمز PIN من ٤ أرقام',
    confirm_pin_label: 'تأكيد رمز PIN',
    create_cta: 'إنشاء الحساب ←',
    creating: 'جارٍ الإنشاء...',
    error_pin_match: 'رمزا PIN غير متطابقين',
    error_pin_length: 'يجب أن يتكون PIN من ٤ أرقام',
    error_phone: 'أدخل رقم هاتف صحيح',
    welcome_back: '!مرحباً 🎉',
    account_ready: 'حسابك جاهز!',
    name_question: 'ما اسمك؟ 😊',
    name_placeholder: 'أدخل اسمك...',
    name_cta: 'هذا أنا! ←',
    continue: 'استمر ←',
  },
}

const TOTAL_QUESTIONS = 3

function ProgressBar({ step }) {
  const pct = (step / TOTAL_QUESTIONS) * 100
  return (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full bg-duo rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
    </div>
  )
}

function OptionCard({ label, icon, selected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 font-display font-bold text-lg text-left transition-all active:scale-[0.98] ${
        selected ? 'border-duo bg-green-50 text-duo' : 'border-gray-200 bg-white text-ink'
      }`}
    >
      <span style={{ fontSize: 28 }}>{icon}</span>
      {label}
    </button>
  )
}

// flow: welcome → language → goal → how → account → graffiti → name
export default function Onboarding({ onComplete, onLanguageChange }) {
  const [screen, setScreen]     = useState('welcome')
  const [mascotSmall, setMascotSmall] = useState(false)
  const [language, setLanguage] = useState('en')
  const [goal, setGoal]         = useState(null)
  const [phone, setPhone]       = useState('')
  const [pin, setPin]           = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [authError, setAuthError]   = useState('')
  const [loading, setLoading]       = useState(false)
  const [name, setName]         = useState('')

  const s = STRINGS[language] || STRINGS.en
  const dir = s.dir

  function handleStart() {
    setMascotSmall(true)
    setTimeout(() => setScreen('language'), 600)
  }

  async function handleCreateAccount() {
    if (pin !== confirmPin) { setAuthError(s.error_pin_match); return }
    if (pin.length !== 4)   { setAuthError(s.error_pin_length); return }
    if (phone.length < 8)   { setAuthError(s.error_phone); return }
    setLoading(true)
    setAuthError('')
    try {
      const fakeEmail = `${phone.replace(/\s+/g, '')}@numio.app`
      const { error } = await supabase.auth.signUp({
        email: fakeEmail,
        password: pin + pin.slice(0, 2),
      })
      if (error) throw error
      const { data: { user } } = await supabase.auth.getUser()
      if (user) await supabase.from('profiles').upsert({ id: user.id, parent_pin: pin })
      setScreen('graffiti')
    } catch (e) {
      setAuthError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveName() {
    if (!name.trim()) return
    try {
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('profiles').upsert({
        id: user.id,
        display_name: name.trim(),
        language: language || 'en',
        coin_balance: 0,
        streak_count: 0,
      })
    } catch (e) { console.error(e) }
    onComplete()
  }

  useEffect(() => {
    if (screen !== 'graffiti') return
    const t = setTimeout(() => setScreen('name'), 3000)
    return () => clearTimeout(t)
  }, [screen])

  // ── WELCOME ───────────────────────────────────────────────────────
  if (screen === 'welcome') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 gap-8" style={{ height: '100dvh' }} dir="ltr">
        <div className="transition-all duration-500" style={{ transform: mascotSmall ? 'scale(0.4) translateY(-120px)' : 'scale(1)', opacity: mascotSmall ? 0 : 1 }}>
          <img src="/mascot.png" alt="Numio" className="w-52 h-auto" />
        </div>
        <div className="text-center" style={{ opacity: mascotSmall ? 0 : 1, transition: 'opacity 0.3s' }}>
          <h1 className="font-display font-extrabold text-4xl text-ink">Welcome to Numio!</h1>
          <p className="font-body text-base text-muted mt-2">Snap. Learn. Earn rewards. 📸</p>
        </div>
        <button onClick={handleStart}
          className="w-full max-w-xs bg-duo text-white font-display font-bold text-xl rounded-2xl py-5 shadow-[0_4px_0_#58a700] active:shadow-none active:translate-y-1 transition-all"
          style={{ opacity: mascotSmall ? 0 : 1, transition: 'opacity 0.3s' }}>
          Let's start →
        </button>
      </div>
    )
  }

  // ── LANGUAGE ──────────────────────────────────────────────────────
  if (screen === 'language') {
    return (
      <div className="min-h-screen bg-white flex flex-col px-5" style={{ height: '100dvh' }} dir="ltr">
        <div className="flex-shrink-0 pt-12 pb-4"><ProgressBar step={1} /></div>
        <div className="flex-shrink-0 flex items-start gap-3 mb-8">
          <img src="/mascot.png" alt="" className="w-14 h-14 object-contain flex-shrink-0" />
          <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 max-w-xs">
            <p className="font-display font-bold text-lg text-ink">What language do you prefer?</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 flex-1">
          <OptionCard label="English" icon="🇬🇧" selected={language === 'en'} onSelect={() => { setLanguage('en'); onLanguageChange?.('en') }} />
          <OptionCard label="العربية" icon="🇸🇦" selected={language === 'ar'} onSelect={() => { setLanguage('ar'); onLanguageChange?.('ar') }} />
        </div>
        <div className="flex-shrink-0 pb-8 pt-4">
          <button onClick={() => setScreen('goal')} disabled={!language}
            className="w-full bg-duo disabled:opacity-40 text-white font-display font-bold text-xl rounded-2xl py-5 shadow-[0_4px_0_#58a700] active:shadow-none active:translate-y-1 transition-all">
            Continue →
          </button>
        </div>
      </div>
    )
  }

  // ── GOAL ──────────────────────────────────────────────────────────
  if (screen === 'goal') {
    return (
      <div className="min-h-screen bg-white flex flex-col px-5" style={{ height: '100dvh' }} dir={dir}>
        <div className="flex-shrink-0 pt-12 pb-4"><ProgressBar step={2} /></div>
        <div className="flex-shrink-0 flex items-start gap-3 mb-8">
          <img src="/mascot.png" alt="" className="w-14 h-14 object-contain flex-shrink-0" />
          <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 max-w-xs">
            <p className="font-display font-bold text-lg text-ink">{s.goal_question}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 flex-1">
          {s.goal_options.map(opt => (
            <OptionCard key={opt.value} label={opt.label} icon={opt.icon} selected={goal === opt.value} onSelect={() => setGoal(opt.value)} />
          ))}
        </div>
        <div className="flex-shrink-0 pb-8 pt-4">
          <button onClick={() => setScreen('how')} disabled={!goal}
            className="w-full bg-duo disabled:opacity-40 text-white font-display font-bold text-xl rounded-2xl py-5 shadow-[0_4px_0_#58a700] active:shadow-none active:translate-y-1 transition-all">
            {s.continue}
          </button>
        </div>
      </div>
    )
  }

  // ── HOW IT WORKS (before account) ────────────────────────────────
  if (screen === 'how') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 gap-8" style={{ height: '100dvh' }} dir={dir}>
        <div className="text-center">
          <img src="/mascot.png" alt="" className="w-24 h-auto mx-auto mb-4" />
          <h1 className="font-display font-extrabold text-3xl text-ink">{s.how_title}</h1>
          <p className="font-body text-base text-muted mt-1">{s.how_sub}</p>
        </div>
        <div className="w-full max-w-sm flex flex-col gap-4">
          {s.how_steps.map((step, i) => (
            <div key={i} className="flex items-center gap-4 bg-gray-50 rounded-2xl px-5 py-4">
              <div className="w-12 h-12 rounded-2xl bg-white border-2 border-gray-100 flex items-center justify-center flex-shrink-0">
                <span style={{ fontSize: 28 }}>{step.icon}</span>
              </div>
              <div>
                <p className="font-display font-bold text-base text-ink">{step.title}</p>
                <p className="font-body text-sm text-muted">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => setScreen('account')}
          className="w-full max-w-sm bg-duo text-white font-display font-bold text-xl rounded-2xl py-5 shadow-[0_4px_0_#58a700] active:shadow-none active:translate-y-1 transition-all">
          {s.how_cta}
        </button>
      </div>
    )
  }

  // ── ACCOUNT ───────────────────────────────────────────────────────
  if (screen === 'account') {
    return (
      <div className="min-h-screen bg-white flex flex-col px-5" style={{ height: '100dvh' }} dir={dir}>
        <div className="flex-shrink-0 pt-12 pb-4"><ProgressBar step={3} /></div>
        <div className="flex-shrink-0 flex items-center gap-3 mb-6">
          <img src="/mascot.png" alt="" className="w-12 h-12 object-contain" />
          <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3">
            <p className="font-display font-bold text-base text-ink">{s.account_bubble}</p>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pb-10">
          <div className="flex flex-col gap-1.5">
            <label className="font-body font-bold text-xs text-muted uppercase tracking-widest">{s.phone_label}</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder={s.phone_placeholder}
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 font-display font-bold text-xl text-ink outline-none focus:border-duo transition-colors" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-body font-bold text-xs text-muted uppercase tracking-widest">{s.pin_label}</label>
            <input type="password" inputMode="numeric" maxLength={4} value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="••••"
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 font-display font-bold text-3xl text-ink outline-none focus:border-duo transition-colors tracking-[1rem]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-body font-bold text-xs text-muted uppercase tracking-widest">{s.confirm_pin_label}</label>
            <input type="password" inputMode="numeric" maxLength={4} value={confirmPin}
              onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="••••"
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 font-display font-bold text-3xl text-ink outline-none focus:border-duo transition-colors tracking-[1rem]" />
          </div>
          {authError && <p className="font-body text-sm text-red-500 font-bold text-center">{authError}</p>}
          <button onClick={handleCreateAccount} disabled={loading || !phone || pin.length !== 4 || confirmPin.length !== 4}
            className="w-full bg-duo disabled:opacity-40 text-white font-display font-bold text-xl rounded-2xl py-5 shadow-[0_4px_0_#58a700] active:shadow-none active:translate-y-1 transition-all mt-2">
            {loading ? s.creating : s.create_cta}
          </button>
        </div>
      </div>
    )
  }

  // ── GRAFFITI ──────────────────────────────────────────────────────
  if (screen === 'graffiti') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 gap-6 relative overflow-hidden" style={{ height: '100dvh' }} dir={dir}>
        {Array.from({ length: 40 }).map((_, i) => {
          const colors = ['#58cc02','#a78bfa','#fbbf24','#f472b6','#60a5fa','#34d399','#fb923c']
          const left = Math.random() * 100
          const delay = Math.random() * 0.6
          const duration = 0.9 + Math.random() * 0.8
          const size = 8 + Math.random() * 10
          const color = colors[i % colors.length]
          const isCircle = i % 3 === 0
          return (
            <div key={i} style={{
              position: 'absolute', bottom: -20, left: `${left}%`,
              width: size, height: size,
              borderRadius: isCircle ? '50%' : 3,
              backgroundColor: color,
              animation: `confetti-rise ${duration}s ${delay}s cubic-bezier(0.2,0.8,0.3,1) both`,
              transform: `rotate(${Math.random() * 360}deg)`,
              pointerEvents: 'none',
            }} />
          )
        })}
        <div style={{ animation: 'pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both', position: 'relative', zIndex: 1 }}>
          <img src="/mascot.png" alt="Numio" className="w-40 h-auto" />
        </div>
        <div className="text-center" style={{ animation: 'pop-in 0.5s 0.15s cubic-bezier(0.34,1.56,0.64,1) both', position: 'relative', zIndex: 1 }}>
          <h1 className="font-display font-extrabold text-5xl text-ink">{s.welcome_back}</h1>
          <p className="font-body text-lg text-muted mt-2">{s.account_ready}</p>
        </div>
        <style>{`
          @keyframes pop-in { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
          @keyframes confetti-rise { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(-110vh) rotate(720deg); opacity: 0; } }
        `}</style>
      </div>
    )
  }

  // ── NAME ──────────────────────────────────────────────────────────
  if (screen === 'name') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 gap-8" style={{ height: '100dvh' }} dir={dir}>
        <div className="flex items-start gap-3 w-full max-w-sm">
          <img src="/mascot.png" alt="" className="w-16 h-16 object-contain flex-shrink-0" />
          <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3">
            <p className="font-display font-bold text-lg text-ink">{s.name_question}</p>
          </div>
        </div>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={s.name_placeholder} autoFocus
          className="w-full max-w-sm border-2 border-gray-200 rounded-2xl px-4 py-4 font-display font-bold text-2xl text-ink outline-none focus:border-duo transition-colors text-center" />
        <button onClick={handleSaveName} disabled={!name.trim()}
          className="w-full max-w-sm bg-duo disabled:opacity-40 text-white font-display font-bold text-xl rounded-2xl py-5 shadow-[0_4px_0_#58a700] active:shadow-none active:translate-y-1 transition-all">
          {s.name_cta}
        </button>
      </div>
    )
  }

  return null
}
