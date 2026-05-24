import { useParams, useNavigate } from 'react-router-dom'
import { getTake } from './store.js'

const modeConfig = {
  creator:   { label: 'Creator',   emoji: '🎥', color: '#D4687A', headerColor: '#DC8595', pageBg: '#FFF0F3' },
  interview: { label: 'Interview', emoji: '💼', color: '#4a6594', headerColor: '#849EC0', pageBg: '#EEF2F8' },
  voiceover: { label: 'Voiceover', emoji: '🎙️', color: '#8b76b8', headerColor: '#B2A4D2', pageBg: '#F2EEFF' },
}

function scoreColor(score) {
  if (score >= 80) return '#16a34a'
  if (score >= 70) return '#d97706'
  return '#dc2626'
}

function getFeedback(score) {
  if (score >= 85) return { label: 'Excellent', text: "Great delivery! Your pace and energy were on point. Keep it up." }
  if (score >= 75) return { label: 'Good', text: "Solid take. A little more confidence in your delivery will take you far." }
  if (score >= 65) return { label: 'Keep Practicing', text: "You're getting there. Focus on your pacing and filler words." }
  return { label: 'Needs Work', text: "Don't give up. Consistent practice is the key to improvement." }
}

function formatDuration(secs) {
  if (!secs) return null
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

export default function Playback() {
  const { mode, id } = useParams()
  const navigate = useNavigate()
  const config = modeConfig[mode] ?? modeConfig.creator
  const isVoiceover = mode === 'voiceover'
  const take = getTake(mode, id)

  if (!take) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-8 text-center font-sans" style={{ backgroundColor: config.pageBg }}>
        <p className="text-3xl">😕</p>
        <p className="text-base font-semibold text-ink">Take not found</p>
        <p className="text-sm text-ink-light">This take may have expired — videos don't survive a page reload.</p>
        <button
          onClick={() => navigate(`/collection/${mode}`)}
          className="mt-2 px-6 py-3 rounded-full font-semibold text-sm text-white cursor-pointer"
          style={{ backgroundColor: config.color }}
        >
          Back to collection
        </button>
      </div>
    )
  }

  const { label: feedbackLabel, text: feedbackText } = getFeedback(take.score)
  const dur = formatDuration(take.duration)

  return (
    <div className="min-h-screen font-sans flex flex-col" style={{ backgroundColor: config.pageBg }}>
      {/* Header */}
      <header className="px-6 py-4" style={{ backgroundColor: config.headerColor }}>
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate(`/collection/${mode}`)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 cursor-pointer"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="text-lg font-extrabold tracking-tight text-white truncate">{take.name}</span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-8 flex flex-col gap-5">

        {/* Media player */}
        <div className="rounded-2xl overflow-hidden border" style={{ borderColor: config.color + '44', backgroundColor: isVoiceover ? 'white' : '#000' }}>
          {isVoiceover ? (
            take.videoUrl
              ? <div className="flex flex-col items-center gap-3 px-8 py-8">
                  <p className="text-sm font-semibold" style={{ color: config.color }}>Audio recording</p>
                  <audio src={take.videoUrl} controls className="w-full" />
                </div>
              : <p className="text-sm text-ink-light text-center py-10">No audio saved.</p>
          ) : (
            take.videoUrl
              ? <video
                  src={take.videoUrl}
                  controls
                  playsInline
                  className="w-full"
                  style={{ maxHeight: '420px', objectFit: 'contain', display: 'block' }}
                />
              : <p className="text-sm text-ink-light text-center py-10">No video saved.</p>
          )}
        </div>

        {/* Score card */}
        <div className="bg-white rounded-2xl border p-6 flex items-center gap-5" style={{ borderColor: config.color + '33' }}>
          <div className="text-center shrink-0">
            <p className="text-4xl font-extrabold tabular-nums leading-none" style={{ color: scoreColor(take.score) }}>{take.score}</p>
            <p className="text-xs text-ink-light mt-1.5">score</p>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2 gap-2">
              <span className="text-sm font-bold" style={{ color: scoreColor(take.score) }}>{feedbackLabel}</span>
              <span className="text-xs text-ink-light shrink-0">
                {[dur, take.date].filter(Boolean).join(' · ')}
              </span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: config.color + '18' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${take.score}%`, backgroundColor: scoreColor(take.score) }}
              />
            </div>
          </div>
        </div>

        {/* Feedback */}
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: config.color + '33' }}>
          <p className="text-sm font-bold text-ink mb-2">Feedback</p>
          <p className="text-sm text-ink-light leading-relaxed">{feedbackText}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pb-4">
          <button
            onClick={() => navigate(`/collection/${mode}`)}
            className="flex-1 py-3.5 rounded-full border-2 font-semibold text-sm transition-all active:scale-95 cursor-pointer"
            style={{ borderColor: config.color, color: config.color }}
          >
            Back to collection
          </button>
          <button
            onClick={() => navigate(`/practice/${mode}`)}
            className="flex-1 py-3.5 rounded-full font-semibold text-sm text-white transition-all active:scale-95 cursor-pointer"
            style={{ backgroundColor: config.color }}
          >
            Record another
          </button>
        </div>

      </main>
    </div>
  )
}
