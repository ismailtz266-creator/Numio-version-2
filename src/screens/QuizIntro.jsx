export default function QuizIntro({ exam, kidName = 'Champ', onStart }) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center"
      style={{ height: '100dvh' }}>

      <div className="w-full max-w-sm flex flex-col items-center gap-6">

        {/* Mascot — floating animation */}
        <div style={{ animation: 'mascot-float 2s ease-in-out infinite' }}>
          <img
            src="/mascot-run.png"
            alt="Numio mascot"
            className="w-52 h-auto"
          />
        </div>

        {/* Text */}
        <div className="flex flex-col gap-2">
          <h1 className="font-display font-extrabold text-3xl text-ink leading-tight">
            {kidName}, let's start!
          </h1>
          <p className="font-display font-bold text-xl text-duo">
            {exam.topic}
          </p>
          <p className="font-body text-base text-muted mt-1">
            You can do this! 💪
          </p>
        </div>

        {/* Quiz info pill */}
        <div className="flex items-center gap-2 bg-gray-50 rounded-full px-5 py-2">
          <span className="text-lg">📝</span>
          <span className="font-body font-bold text-sm text-muted">
            {exam.questions?.length} questions
          </span>
        </div>

        {/* CTA */}
        <button
          onClick={onStart}
          className="w-full bg-duo active:bg-duo-dark hover:bg-duo-dark text-white font-display font-extrabold text-xl rounded-2xl py-5 shadow-[0_5px_0_#58a700] active:shadow-none active:translate-y-1 transition-all mt-2"
        >
          START →
        </button>
      </div>

      <style>{`
        @keyframes mascot-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  )
}
