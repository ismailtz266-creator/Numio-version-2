// Shown after quiz results when the kid completes a quiz on a new day

export default function StreakPopup({ streakCount, onClose }) {
  const isFirst   = streakCount === 1
  const isMilestone = [3, 5, 7, 10, 14, 21, 30].includes(streakCount)

  let headline, sub
  if (isFirst) {
    headline = "You're on a streak! ⚡"
    sub = "Come back tomorrow to keep it going!"
  } else if (isMilestone) {
    headline = `${streakCount} days in a row! 🔥`
    sub = "That's incredible — keep it up!"
  } else {
    headline = `${streakCount} day streak! ⚡`
    sub = "You're building great habits!"
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white px-6"
      style={{ height: '100dvh' }}
    >
      <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center">

        {/* Streak cards image — static, no bounce */}
        <img
          src="/streak-mascot.png"
          alt="Streak"
          className="w-64 h-auto"
        />

        {/* Streak count */}
        <div className="flex items-center justify-center gap-3">
          {Array.from({ length: Math.min(streakCount, 7) }).map((_, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: i < streakCount ? 'linear-gradient(135deg, #a78bfa, #7c3aed)' : '#f3f4f6',
              }}
            >
              <img src="/streak-icon.png" alt="" className="w-6 h-6" onError={e => {
                e.target.style.display = 'none'
                e.target.parentElement.innerHTML = '⚡'
              }} />
            </div>
          ))}
          {streakCount > 7 && (
            <span className="font-display font-extrabold text-2xl text-purple-500">
              +{streakCount - 7}
            </span>
          )}
        </div>

        {/* Text */}
        <div>
          <h2 className="font-display font-extrabold text-3xl text-ink">{headline}</h2>
          <p className="font-body text-base text-muted mt-2">{sub}</p>
        </div>

        {/* CTA */}
        <button
          onClick={onClose}
          className="w-full bg-duo active:bg-duo-dark text-white font-display font-bold text-xl rounded-2xl py-5 shadow-[0_4px_0_#58a700] active:shadow-none active:translate-y-1 transition-all"
        >
          Keep it up! 💪
        </button>
      </div>
    </div>
  )
}
