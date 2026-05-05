import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const modeConfig = {
  creator: {
    label: 'Creator',
    emoji: '🎥',
    color: '#D4687A',
    headerColor: '#DC8595',
    pageBg: '#FFF0F3',
  },
  interview: {
    label: 'Interview',
    emoji: '💼',
    color: '#4a6594',
    headerColor: '#849EC0',
    pageBg: '#EEF2F8',
  },
  voiceover: {
    label: 'Voiceover',
    emoji: '🎙️',
    color: '#8b76b8',
    headerColor: '#B2A4D2',
    pageBg: '#F2EEFF',
  },
}

const prompts = {
  creator: [
    'Introduce yourself and your channel in 30 seconds.',
    'Share one tip your audience needs to hear right now.',
    'React to a recent trend in your niche.',
    'Tell a story about why you started creating.',
    'Pitch your next video idea like you\'re talking to a friend.',
    'Give your honest take on something everyone else gets wrong.',
    'Walk through your morning routine in under a minute.',
  ],
  interview: [
    'Tell me about yourself.',
    'Describe a time you handled a difficult coworker.',
    'What\'s your greatest professional weakness?',
    'Walk me through a project you\'re most proud of.',
    'Why do you want to leave your current role?',
    'Where do you see yourself in five years?',
    'Tell me about a time you failed and what you learned.',
  ],
  voiceover: [
    'The future of transportation isn\'t a car — it\'s a conversation.',
    'She opened the letter slowly, not sure she was ready for what was inside.',
    'Welcome back to another episode. Today, we\'re diving deep.',
    'For decades, scientists have wondered what lies beyond the edge of the universe.',
    'This product was built for one reason: to make your morning easier.',
    'Sometimes the smallest changes make the biggest difference.',
    'In a world moving faster than ever, clarity is your superpower.',
  ],
}

function randomPrompt(mode, current) {
  const list = prompts[mode] ?? []
  const available = list.filter(p => p !== current)
  return available[Math.floor(Math.random() * available.length)] ?? list[0]
}

export default function Practice() {
  const { mode } = useParams()
  const navigate = useNavigate()
  const config = modeConfig[mode] ?? modeConfig.creator

  const [prompt, setPrompt] = useState(() => randomPrompt(mode, null))
  const [camError, setCamError] = useState(null)
  const [shuffleHover, setShuffleHover] = useState(false)
  const [shuffleActive, setShuffleActive] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [recording, setRecording] = useState(false)

  const videoRef = useRef(null)

  useEffect(() => {
    let stream
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then(s => {
        stream = s
        if (videoRef.current) videoRef.current.srcObject = s
      })
      .catch(() => setCamError('Camera access denied. Please allow camera permissions and try again.'))
    return () => stream?.getTracks().forEach(t => t.stop())
  }, [])

  const shuffle = () => setPrompt(p => randomPrompt(mode, p))

  const handleRecord = () => {
    if (!recording) setNotesOpen(false)
    setRecording(r => !r)
  }

  return (
    <div className="min-h-screen font-sans flex flex-col" style={{ backgroundColor: config.pageBg }}>

      {/* Header */}
      <header className="px-6 py-4" style={{ backgroundColor: config.headerColor }}>
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">{config.emoji}</span>
            <span className="text-lg font-extrabold tracking-tight text-white">
              {config.label}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-8 flex flex-col gap-6">

        {/* Prompt card */}
        <div className="bg-white rounded-2xl border-2 p-8 mt-10" style={{ borderColor: config.color + 'aa' }}>
          <div className="flex items-start justify-between gap-6">
            <p className="text-base font-semibold text-ink leading-relaxed flex-1">
              {prompt}
            </p>
            <button
              onClick={shuffle}
              title="Shuffle prompt"
              onMouseEnter={() => setShuffleHover(true)}
              onMouseLeave={() => { setShuffleHover(false); setShuffleActive(false) }}
              onMouseDown={() => setShuffleActive(true)}
              onMouseUp={() => setShuffleActive(false)}
              style={{
                cursor: 'pointer',
                transform: shuffleActive ? 'scale(0.88)' : shuffleHover ? 'scale(1.12)' : 'scale(1)',
                backgroundColor: shuffleHover ? config.color + '18' : 'white',
                borderColor: shuffleHover ? config.color : config.color + '55',
                transition: 'transform 120ms ease, background-color 120ms ease, border-color 120ms ease',
              }}
              className="shrink-0 w-9 h-9 rounded-xl border-2 flex items-center justify-center"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 5h9.5M2 11h9.5" stroke={config.color} strokeWidth="1.5" strokeLinecap="round" />
                <path d="M10 3l3 2-3 2M10 9l3 2-3 2" stroke={config.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-ink-light mt-4">Read the prompt, then hit record when you're ready.</p>
        </div>

        {/* Notes / Script */}
        <div className="bg-white rounded-2xl border-2 overflow-hidden" style={{ borderColor: config.color + 'aa' }}>
          <button
            onClick={() => setNotesOpen(o => !o)}
            className="w-full flex items-center justify-between px-5 py-3.5"
            style={{ cursor: 'pointer' }}
          >
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9.5 1.5l3 3L4 13H1v-3L9.5 1.5z" stroke={config.color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm font-semibold" style={{ color: config.color }}>Notes / Script</span>
            </div>
            <svg
              width="14" height="14" viewBox="0 0 14 14" fill="none"
              style={{ transform: notesOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease' }}
            >
              <path d="M2 5l5 5 5-5" stroke={config.color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div style={{ maxHeight: notesOpen ? '200px' : '0', overflow: 'hidden', transition: 'max-height 250ms ease' }}>
            <div className="px-5 pb-4 pt-1">
              <textarea
                placeholder="Add notes or script..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={4}
                className="w-full resize-none text-sm text-ink leading-relaxed outline-none bg-transparent placeholder:text-ink-light font-sans"
              />
            </div>
          </div>
        </div>

        {/* Webcam feed */}
        <div className="flex-1 rounded-2xl overflow-hidden border border-blush-border bg-[#1a0a07] relative min-h-64">
          {camError ? (
            <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
              <p className="text-sm text-blush-dark">{camError}</p>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
          )}
        </div>

        {/* Record button */}
        <div className="flex justify-center pb-4">
          <button
            onClick={handleRecord}
            className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-150 hover:scale-110 active:scale-90 cursor-pointer"
            style={{ backgroundColor: config.color }}
          >
            {recording
              ? <div className="w-6 h-6 bg-white rounded-md" />
              : <div className="w-7 h-7 bg-white rounded-full" />
            }
          </button>
        </div>

      </main>
    </div>
  )
}
