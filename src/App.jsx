const modes = [
  {
    emoji: '🎥',
    tag: 'Creator',
    title: 'For creators & content makers',
    description:
      'Build the habit of showing up on camera. Practice your hook, your energy, and your presence — for YouTube, TikTok, Instagram, or anywhere you create.',
    bg: 'bg-[#fff5f2]',
    tagBg: 'bg-[#fce8e2] text-[#7b3a2e]',
  },
  {
    emoji: '💼',
    tag: 'Interview',
    title: 'For job seekers & professionals',
    description:
      'Stop rehearsing in your head and start rehearsing on screen. Nail your composure, eye contact, and delivery before it really counts.',
    bg: 'bg-white',
    tagBg: 'bg-[#fce8e2] text-[#7b3a2e]',
  },
  {
    emoji: '🎙️',
    tag: 'Voiceover',
    title: 'For voice & narration work',
    description:
      'Refine your pacing, warmth, and clarity. Whether it\'s an ad read, podcast, or explainer — sound like yourself at your very best.',
    bg: 'bg-[#fff5f2]',
    tagBg: 'bg-[#fce8e2] text-[#7b3a2e]',
  },
]

function Header() {
  return (
    <header className="bg-cream border-b border-blush-border px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-coral rounded-lg flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="3" fill="white" />
              <path d="M2 5.5h1.5M2 10.5h1.5M12.5 5.5H14M12.5 10.5H14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <rect x="1" y="4" width="14" height="8" rx="2" stroke="white" strokeWidth="1.5" />
            </svg>
          </div>
          <span className="text-xl font-bold text-ink tracking-tight">TakeOne</span>
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

function ModeCard({ emoji, tag, title, description, bg, tagBg }) {
  return (
    <div
      className={`${bg} rounded-2xl p-8 border border-blush-border hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col`}
    >
      <div className="text-4xl mb-5">{emoji}</div>
      <span className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full mb-4 w-fit ${tagBg}`}>
        {tag}
      </span>
      <h3 className="text-lg font-bold text-ink mb-3 leading-snug">{title}</h3>
      <p className="text-ink-mid text-sm leading-relaxed mb-6 flex-1">{description}</p>
      <button className="w-full bg-coral hover:bg-coral-dark text-white font-semibold text-sm py-3 rounded-full transition-colors cursor-pointer">
        Start practice
      </button>
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-cream font-sans">
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-ink tracking-tight mb-2">
            What are you practicing today?
          </h1>
          <p className="text-base text-ink-mid">
            Choose a mode to get started. Your camera is ready when you are.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modes.map((mode) => (
            <ModeCard key={mode.tag} {...mode} />
          ))}
        </div>
      </main>
    </div>
  )
}
