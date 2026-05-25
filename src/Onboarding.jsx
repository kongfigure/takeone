import { useState } from 'react'

const CORAL = '#D4687A'
const CREAM = '#FFF0F3'

const slides = [
  {
    emoji: '🎬',
    title: 'Welcome to TakeOne',
    body: "Your private space to practice on camera and actually get better. No audience, no pressure, just you and your takes.",
  },
  {
    emoji: '🎯',
    title: 'Pick your mode',
    body: "Creator for content, Interview for job prep, Voiceover for audio work. Each mode gives you tailored prompts and feedback.",
    modes: [
      { label: 'Creator',   color: '#D4687A' },
      { label: 'Interview', color: '#4a6594' },
      { label: 'Voiceover', color: '#8b76b8' },
    ],
  },
  {
    emoji: '📹',
    title: 'Record or upload',
    body: "Practice live or upload an existing video. TakeOne analyzes your speech, energy, and delivery.",
  },
  {
    emoji: '🔥',
    title: 'Get roasted',
    body: "Honest, funny, specific AI feedback on every take. Because real improvement needs real feedback.",
  },
  {
    emoji: '📊',
    title: 'How we score you',
    body: "Every roast is backed by real data. Not vibes. Numbers.",
    metrics: [
      { emoji: '🗣️', label: 'Speech clarity' },
      { emoji: '⚡', label: 'Energy and pace' },
      { emoji: '🧹', label: 'Filler words' },
      { emoji: '👁️', label: 'Eye contact' },
      { emoji: '✨', label: 'Overall presence' },
    ],
  },
]

export default function Onboarding({ onClose }) {
  const [idx, setIdx] = useState(0)
  const slide = slides[idx]
  const isLast = idx === slides.length - 1

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm relative" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-xs cursor-pointer transition-colors z-10"
          style={{ color: '#b0908c', backgroundColor: '#FFF0F3' }}
        >
          ✕
        </button>

        {/* Card content */}
        <div className="px-8 pt-10 pb-4">
          {/* Emoji illustration */}
          <div className="flex justify-center mb-5">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: CREAM }}
            >
              <span className="text-4xl">{slide.emoji}</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-extrabold text-ink text-center mb-3">{slide.title}</h2>

          {/* Mode pills — slide 2 */}
          {slide.modes && (
            <div className="flex justify-center gap-2 mb-4 flex-wrap">
              {slide.modes.map(m => (
                <span
                  key={m.label}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: m.color }}
                >
                  {m.label}
                </span>
              ))}
            </div>
          )}

          {/* Metrics list — slide 5 */}
          {slide.metrics && (
            <div className="flex flex-col gap-1.5 mb-4">
              {slide.metrics.map(m => (
                <div
                  key={m.label}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl"
                  style={{ backgroundColor: CREAM }}
                >
                  <span className="text-base leading-none">{m.emoji}</span>
                  <span className="text-sm font-semibold text-ink">{m.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Body */}
          <p className="text-sm text-ink-light text-center leading-relaxed">{slide.body}</p>
        </div>

        {/* Footer navigation */}
        <div className="px-8 pb-8 pt-5 flex flex-col items-center gap-4">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className="rounded-full transition-all duration-200 cursor-pointer"
                style={{
                  width: i === idx ? '20px' : '6px',
                  height: '6px',
                  backgroundColor: i === idx ? CORAL : '#E8CDD0',
                }}
              />
            ))}
          </div>

          {/* Primary button */}
          <button
            onClick={isLast ? onClose : () => setIdx(i => i + 1)}
            className="w-full py-3.5 rounded-full font-bold text-sm text-white transition-all cursor-pointer active:scale-95 hover:opacity-90"
            style={{ backgroundColor: CORAL }}
          >
            {isLast ? "Let's go" : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
