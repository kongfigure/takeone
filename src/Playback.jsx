import { useState } from 'react'
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

function getSimpleFeedback(score) {
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

const modeWeights = {
  creator:   { label: '60% Creator · 40% Technical' },
  interview: { label: '70% Technical · 30% Interview' },
  voiceover: { label: '50% Creator · 50% Technical' },
}

const technicalMetrics = [
  { key: 'fillerWords', emoji: '🧹', label: 'Filler Words',   desc: '"Um", "like", "basically" — words that break your flow' },
  { key: 'pace',        emoji: '⚡', label: 'Pace',            desc: 'Speaking speed — ideal is 120-160 WPM' },
  { key: 'clarity',     emoji: '🗣️', label: 'Clarity',        desc: 'Clear articulation, coherent sentences, logical structure' },
  { key: 'completion',  emoji: '✅', label: 'Completion',      desc: 'Did you fully answer the prompt without bailing?' },
]

const creatorMetrics = [
  { key: 'energy',          emoji: '🔋', label: 'Energy',           desc: 'Vocal enthusiasm, variation, and liveliness' },
  { key: 'charisma',        emoji: '✨', label: 'Charisma',          desc: 'Magnetic, compelling presence — do you draw people in?' },
  { key: 'hookStrength',    emoji: '🎣', label: 'Hook Strength',     desc: 'Did the first 5-10 seconds grab attention?' },
  { key: 'storytellingFlow',emoji: '📖', label: 'Storytelling Flow', desc: 'Narrative arc, emotional beats, smooth transitions' },
  { key: 'watchability',    emoji: '👁️', label: 'Watchability',     desc: 'Would a stranger watch this to the end?' },
]

const interviewMetrics = [
  { key: 'professionalScore', emoji: '💼', label: 'Professionalism', desc: 'Structure, specificity, and overall professional presence' },
  { key: 'structureScore',    emoji: '🏗️', label: 'Structure',       desc: 'Clear beginning, middle, end — STAR method or similar' },
  { key: 'specificityScore',  emoji: '🎯', label: 'Specificity',      desc: 'Concrete examples vs vague buzzwords and generalities' },
  { key: 'composure',         emoji: '🧘', label: 'Composure',        desc: 'Confident and composed vs nervous and rushed' },
  { key: 'impression',        emoji: '🤝', label: 'Impression',       desc: 'Would a hiring manager be impressed, neutral, or concerned?' },
]

function ScoreBar({ label, value, color }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-ink-light w-24 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: color + '20' }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, backgroundColor: scoreColor(value) }}
        />
      </div>
      <span className="text-xs font-bold tabular-nums w-7 text-right" style={{ color: scoreColor(value) }}>{value}</span>
    </div>
  )
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

  const [calcOpen, setCalcOpen] = useState(false)

  const isInterviewTake = !!take.interviewScores
  const hasDualScore = !!(take.technicalScores && (take.creatorScores || take.interviewScores))
  const hasAI = hasDualScore || !!take.aiScores
  const secondaryScore = isInterviewTake ? take.interviewScore : take.creatorScore
  const secondaryScores = isInterviewTake ? take.interviewScores : take.creatorScores
  const secondaryMetrics = isInterviewTake ? interviewMetrics : creatorMetrics
  const secondaryLabel = isInterviewTake ? 'Interview' : 'Creator'
  const weights = modeWeights[mode] ?? modeWeights.voiceover
  const { label: simpleLabel, text: simpleText } = getSimpleFeedback(take.score)
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

        {/* Confidence score card */}
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: config.color + '33' }}>
          <div className="flex items-center gap-5">
            <div className="text-center shrink-0">
              <p className="text-4xl font-extrabold tabular-nums leading-none" style={{ color: scoreColor(take.score) }}>{take.score}</p>
              <p className="text-xs text-ink-light mt-1.5">confidence</p>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2 gap-2">
                <span className="text-sm font-bold" style={{ color: scoreColor(take.score) }}>
                  {hasAI ? 'Confidence Score' : simpleLabel}
                </span>
                <span className="text-xs text-ink-light shrink-0">
                  {[dur, take.date].filter(Boolean).join(' · ')}
                </span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: config.color + '18' }}>
                <div className="h-full rounded-full" style={{ width: `${take.score}%`, backgroundColor: scoreColor(take.score) }} />
              </div>
              {hasDualScore && (
                <p className="text-xs text-ink-light mt-1.5">{weights.label}</p>
              )}
            </div>
          </div>
        </div>

        {/* Dual score tracks */}
        {hasDualScore && (
          <div className="grid grid-cols-2 gap-3">
            {/* Technical */}
            <div className="bg-white rounded-2xl border p-4" style={{ borderColor: config.color + '33' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-widest text-ink-light">Technical</p>
                <span className="text-xl font-extrabold tabular-nums" style={{ color: scoreColor(take.technicalScore) }}>{take.technicalScore}</span>
              </div>
              <div className="flex flex-col gap-2">
                {technicalMetrics.map(m => take.technicalScores[m.key] != null && (
                  <ScoreBar key={m.key} label={m.label} value={take.technicalScores[m.key]} color={config.color} />
                ))}
              </div>
            </div>
            {/* Secondary track — Interview or Creator */}
            <div className="bg-white rounded-2xl border p-4" style={{ borderColor: config.color + '33' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-widest text-ink-light">{secondaryLabel}</p>
                <span className="text-xl font-extrabold tabular-nums" style={{ color: scoreColor(secondaryScore) }}>{secondaryScore}</span>
              </div>
              <div className="flex flex-col gap-2">
                {secondaryMetrics.map(m => secondaryScores[m.key] != null && (
                  <ScoreBar key={m.key} label={m.label} value={secondaryScores[m.key]} color={config.color} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Roast feedback */}
        {hasAI && take.roastFeedback?.length > 0 && (
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: config.color + '33' }}>
            <p className="text-sm font-bold text-ink mb-3">The Real Talk 🔥</p>
            <div className="flex flex-col gap-3">
              {take.roastFeedback.map((msg, i) => (
                <div
                  key={i}
                  className="text-sm text-ink leading-relaxed px-4 py-3 rounded-xl"
                  style={{ backgroundColor: config.color + '0d' }}
                >
                  {msg}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strengths */}
        {hasAI && take.strengths?.length > 0 && (
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: config.color + '33' }}>
            <p className="text-sm font-bold text-ink mb-3">What worked ✨</p>
            <div className="flex flex-col gap-2">
              {take.strengths.map((s, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="text-green-500 mt-0.5 shrink-0 text-sm">✓</span>
                  <p className="text-sm text-ink leading-relaxed">{s}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top tip */}
        {hasAI && take.topTip && (
          <div className="rounded-2xl p-5" style={{ backgroundColor: config.color + '15', border: `1.5px solid ${config.color}44` }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: config.color }}>Top tip 💡</p>
            <p className="text-sm font-medium text-ink leading-relaxed">{take.topTip}</p>
          </div>
        )}

        {/* Simple feedback fallback (no AI) */}
        {!hasAI && (
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: config.color + '33' }}>
            <p className="text-sm font-bold text-ink mb-2">Feedback</p>
            <p className="text-sm text-ink-light leading-relaxed">{simpleText}</p>
          </div>
        )}

        {/* How was this calculated — collapsible, AI takes only */}
        {hasDualScore && (
          <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: config.color + '33' }}>
            <button
              onClick={() => setCalcOpen(o => !o)}
              className="w-full flex items-center justify-between px-5 py-4 cursor-pointer text-left"
            >
              <span className="text-sm font-semibold text-ink">How was this calculated?</span>
              <svg
                width="14" height="14" viewBox="0 0 14 14" fill="none"
                style={{ transform: calcOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease', flexShrink: 0 }}
              >
                <path d="M2 5l5 5 5-5" stroke={config.color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div style={{ maxHeight: calcOpen ? '900px' : '0', overflow: 'hidden', transition: 'max-height 350ms ease' }}>
              <div className="px-5 pb-5 border-t" style={{ borderColor: config.color + '18' }}>

                <p className="text-xs font-bold uppercase tracking-widest mt-4 mb-3" style={{ color: config.color }}>Technical Track</p>
                <div className="flex flex-col gap-3 mb-5">
                  {technicalMetrics.map(m => {
                    const score = take.technicalScores?.[m.key]
                    if (score == null) return null
                    return (
                      <div key={m.key}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm leading-none">{m.emoji}</span>
                            <span className="text-sm font-semibold text-ink">{m.label}</span>
                          </div>
                          <span className="text-sm font-bold tabular-nums" style={{ color: scoreColor(score) }}>{score}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full mb-1" style={{ backgroundColor: config.color + '18' }}>
                          <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: scoreColor(score) }} />
                        </div>
                        <p className="text-xs text-ink-light">{m.desc}</p>
                      </div>
                    )
                  })}
                </div>

                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: config.color }}>{secondaryLabel} Track</p>
                <div className="flex flex-col gap-3">
                  {secondaryMetrics.map(m => {
                    const score = secondaryScores?.[m.key]
                    if (score == null) return null
                    return (
                      <div key={m.key}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm leading-none">{m.emoji}</span>
                            <span className="text-sm font-semibold text-ink">{m.label}</span>
                          </div>
                          <span className="text-sm font-bold tabular-nums" style={{ color: scoreColor(score) }}>{score}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full mb-1" style={{ backgroundColor: config.color + '18' }}>
                          <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: scoreColor(score) }} />
                        </div>
                        <p className="text-xs text-ink-light">{m.desc}</p>
                      </div>
                    )
                  })}
                </div>

                <p className="text-xs text-ink-light text-center mt-5 pt-3 border-t" style={{ borderColor: config.color + '18' }}>
                  Confidence = {weights.label.toLowerCase()}
                </p>
              </div>
            </div>
          </div>
        )}

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
