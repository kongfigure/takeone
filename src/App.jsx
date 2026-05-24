import { Routes, Route, useNavigate } from 'react-router-dom'
import Practice from './Practice.jsx'
import Collection from './Collection.jsx'
import Playback from './Playback.jsx'
import takeoneLogo from './assets/takeone-logo.png'

const recentSessions = [
  { mode: 'Creator',   emoji: '🎥', date: 'Today, 2:14 PM',     duration: '4 min', score: 82 },
  { mode: 'Interview', emoji: '💼', date: 'Yesterday, 10:30 AM', duration: '7 min', score: 76 },
  { mode: 'Voiceover', emoji: '🎙️', date: 'May 3, 9:05 AM',     duration: '3 min', score: 88 },
  { mode: 'Creator',   emoji: '🎥', date: 'May 2, 4:45 PM',      duration: '5 min', score: 71 },
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning.'
  if (h < 17) return 'Good afternoon.'
  return 'Good evening.'
}

function Header() {
  return (
    <header className="bg-cream border-b border-blush-border px-6 py-4">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src={takeoneLogo} alt="TakeOne" style={{ height: '40px' }} />
          <span className="text-2xl font-bold text-ink tracking-tight">Take One</span>
        </div>

        <button className="w-9 h-9 bg-blush rounded-full flex items-center justify-center border border-blush-border hover:bg-blush-dark transition-colors cursor-pointer">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="6" r="2.5" stroke="#7b3a2e" strokeWidth="1.5" />
            <path d="M3 13c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="#7b3a2e" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </header>
  )
}

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-blush-border flex flex-col gap-0.5">
      <span className="text-2xl font-extrabold text-ink leading-none">{value}</span>
      <span className="text-sm font-semibold text-ink mt-1">{label}</span>
      <span className="text-xs text-ink-light">{sub}</span>
    </div>
  )
}

function ModeButton({ emoji, label, mode }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(`/collection/${mode}`)}
      className="flex-1 flex items-center justify-center gap-2 bg-blush hover:bg-blush-dark border border-blush-border text-ink font-semibold text-sm py-3.5 rounded-xl transition-colors cursor-pointer"
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </button>
  )
}

function SessionRow({ mode, emoji, date, duration, score }) {
  return (
    <div className="flex items-center gap-4 py-3.5">
      <div className="w-9 h-9 bg-blush rounded-xl flex items-center justify-center text-lg shrink-0">
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink">{mode}</p>
        <p className="text-xs text-ink-light">{date} · {duration}</p>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-sm font-bold text-coral">{score}</span>
        <span className="text-xs text-ink-light">score</span>
      </div>
    </div>
  )
}

function Dashboard() {
  return (
    <div className="min-h-screen bg-cream font-sans">
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-ink mb-1">
            {getGreeting()}
          </h1>
          <p className="text-sm text-ink-mid">Ready for today's take?</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Day streak" value="12" sub="Keep it up 🔥" />
          <StatCard label="Confidence" value="84" sub="↑ 3 this week" />
          <StatCard label="Sessions"   value="47" sub="All time" />
        </div>

        <div className="mb-8">
          <p className="text-xs font-semibold text-ink-light uppercase tracking-widest mb-3">
            Start a session
          </p>
          <div className="flex gap-3">
            <ModeButton emoji="🎥" label="Creator"   mode="creator" />
            <ModeButton emoji="💼" label="Interview" mode="interview" />
            <ModeButton emoji="🎙️" label="Voiceover" mode="voiceover" />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-ink-light uppercase tracking-widest mb-3">
            Recent sessions
          </p>
          <div className="bg-white rounded-2xl border border-blush-border px-5 divide-y divide-blush-border">
            {recentSessions.map((s, i) => (
              <SessionRow key={i} {...s} />
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/collection/:mode" element={<Collection />} />
      <Route path="/practice/:mode" element={<Practice />} />
      <Route path="/playback/:mode/:id" element={<Playback />} />
    </Routes>
  )
}
