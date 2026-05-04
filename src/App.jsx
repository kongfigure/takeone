function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-cream/90 backdrop-blur-sm border-b border-blush-border px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
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

        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm font-medium text-ink-mid hover:text-ink transition-colors">
            How it works
          </a>
          <a href="#modes" className="text-sm font-medium text-ink-mid hover:text-ink transition-colors">
            Modes
          </a>
          <a href="#pricing" className="text-sm font-medium text-ink-mid hover:text-ink transition-colors">
            Pricing
          </a>
        </div>

        <button className="bg-coral hover:bg-coral-dark text-white font-semibold text-sm px-5 py-2.5 rounded-full transition-colors cursor-pointer">
          Try free
        </button>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream px-6 py-28 md:py-36">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, #fce8e2 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-blush text-ink-mid text-xs font-semibold px-4 py-1.5 rounded-full mb-10 border border-blush-border tracking-wide uppercase">
          <span>🎬</span>
          <span>Camera confidence training</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-ink leading-[1.05] tracking-tight mb-6">
          Stop freezing.{' '}
          <span className="text-coral">Start showing up.</span>
        </h1>

        <p className="text-lg md:text-xl text-ink-mid max-w-xl mx-auto mb-10 leading-relaxed">
          TakeOne gives you a private space to practice on camera — no audience, no pressure, no judgment. Just you and your takes.
        </p>

        <button className="inline-flex items-center gap-2 bg-coral hover:bg-coral-dark text-white font-bold text-base md:text-lg px-8 py-4 rounded-full transition-colors shadow-lg cursor-pointer">
          Try your first take — free
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3.75 9h10.5M9.75 4.5L14.25 9l-4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <p className="text-sm text-ink-light mt-5">
          No credit card needed · Works in your browser
        </p>
      </div>
    </section>
  )
}

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

function ModeCard({ emoji, tag, title, description, bg, tagBg }) {
  return (
    <div
      className={`${bg} rounded-2xl p-8 border border-blush-border hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer`}
    >
      <div className="text-4xl mb-5">{emoji}</div>
      <span className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full mb-4 ${tagBg}`}>
        {tag}
      </span>
      <h3 className="text-lg font-bold text-ink mb-3 leading-snug">{title}</h3>
      <p className="text-ink-mid text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function ModesSection() {
  return (
    <section id="modes" className="bg-blush px-6 py-24">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-ink mb-4 tracking-tight">
            Pick your practice mode
          </h2>
          <p className="text-lg text-ink-mid max-w-lg mx-auto">
            Three ways to practice. One goal: showing up on camera with ease.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modes.map((mode) => (
            <ModeCard key={mode.tag} {...mode} />
          ))}
        </div>
      </div>
    </section>
  )
}

function CtaSection() {
  return (
    <section className="bg-cream px-6 py-24 text-center">
      <div className="max-w-2xl mx-auto">
        <p className="text-5xl mb-6">✨</p>
        <h2 className="text-3xl md:text-4xl font-extrabold text-ink mb-4 tracking-tight">
          Your camera is waiting.
        </h2>
        <p className="text-lg text-ink-mid mb-10 leading-relaxed">
          The hardest part is pressing record the first time. TakeOne makes that first take feel safe.
        </p>
        <button className="inline-flex items-center gap-2 bg-coral hover:bg-coral-dark text-white font-bold text-lg px-10 py-4 rounded-full transition-colors shadow-lg cursor-pointer">
          Try your first take — free
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3.75 9h10.5M9.75 4.5L14.25 9l-4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p className="text-sm text-ink-light mt-4">Free forever for your first 3 takes.</p>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-blush-border bg-cream px-6 py-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-coral rounded-md flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="3" fill="white" />
              <rect x="1" y="4" width="14" height="8" rx="2" stroke="white" strokeWidth="1.5" />
            </svg>
          </div>
          <span className="font-bold text-ink text-sm">TakeOne</span>
        </div>
        <p className="text-xs text-ink-light">
          © {new Date().getFullYear()} TakeOne. Made with warmth.
        </p>
        <div className="flex items-center gap-6">
          <a href="#" className="text-xs text-ink-mid hover:text-ink transition-colors">Privacy</a>
          <a href="#" className="text-xs text-ink-mid hover:text-ink transition-colors">Terms</a>
          <a href="#" className="text-xs text-ink-mid hover:text-ink transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <div className="min-h-screen font-sans">
      <Navbar />
      <main>
        <Hero />
        <ModesSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
