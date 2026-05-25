import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { addTake, getTakes } from './store.js'

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
    "Pitch your next video idea like you're talking to a friend.",
    'Give your honest take on something everyone else gets wrong.',
    'Walk through your morning routine in under a minute.',
  ],
  interview: [
    'Tell me about yourself.',
    'Describe a time you handled a difficult coworker.',
    "What's your greatest professional weakness?",
    "Walk me through a project you're most proud of.",
    'Why do you want to leave your current role?',
    'Where do you see yourself in five years?',
    'Tell me about a time you failed and what you learned.',
  ],
  voiceover: [
    "The future of transportation isn't a car — it's a conversation.",
    'She opened the letter slowly, not sure she was ready for what was inside.',
    "Welcome back to another episode. Today, we're diving deep.",
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

function getSupportedMimeType(audio = false) {
  const types = audio
    ? ['audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']
    : ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4']
  return types.find(t => MediaRecorder.isTypeSupported(t)) ?? ''
}

function formatTime(s) {
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

function countFillerWords(transcript) {
  if (!transcript) return {}
  const text = transcript.toLowerCase()
  const fillers = ['like', 'um', 'uh', 'you know', 'basically', 'literally', 'right', 'okay', 'so']
  const counts = {}
  for (const word of fillers) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    const matches = text.match(regex)
    if (matches?.length) counts[word] = matches.length
  }
  return counts
}

function computeWpm(transcript, durationSeconds) {
  if (!transcript || !durationSeconds) return 0
  const words = transcript.trim().split(/\s+/).filter(Boolean).length
  return Math.round((words / durationSeconds) * 60)
}

async function analyzeWithAI({ transcript, duration, fillerCounts, wpm, ratingsSummary, modeLabel, promptText }) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('No API key — add VITE_ANTHROPIC_API_KEY to .env.local')

  const totalFillers = Object.values(fillerCounts).reduce((a, b) => a + b, 0)
  const fillerSummary = totalFillers > 0
    ? Object.entries(fillerCounts).map(([w, c]) => `"${w}": ${c}`).join(', ')
    : 'none detected'

  const system = `You are TakeOne's AI coach — brutally honest, specific, and funny like a Gen Z Gordon Ramsay.

Return ONLY a valid JSON object with exactly this structure (no markdown fences, no extra text):
{
  "scores": {
    "fillerWords": 0-100,
    "pace": 0-100,
    "clarity": 0-100,
    "vocabulary": 0-100,
    "energy": 0-100,
    "overall": 0-100
  },
  "roastFeedback": [
    "funny specific roast 1",
    "funny specific roast 2",
    "funny specific roast 3"
  ],
  "strengths": [
    "genuine strength 1",
    "genuine strength 2"
  ],
  "topTip": "one actionable specific improvement"
}

Roast feedback rules: funny but not mean, specific to their actual transcript, reference exact words they said or exact counts, Gen Z energy like a brutally honest friend. Never be generic. If they said "like" 8 times, say exactly that.`

  const userMsg = `Here is the user's recording data:
- Transcript: ${transcript || '[no transcript captured — audio-only or speech recognition unavailable]'}
- Duration: ${duration} seconds
- Words per minute: ${wpm}
- Filler word count: ${fillerSummary} (total: ${totalFillers})
- Self-rated: ${ratingsSummary}
- Mode: ${modeLabel}
- Prompt they were responding to: ${promptText}

Analyze this and return the JSON.`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system,
      messages: [{ role: 'user', content: userMsg }],
    }),
  })

  if (!res.ok) throw new Error(`API error ${res.status}`)
  const data = await res.json()
  return JSON.parse(data.content[0].text)
}

const BAR_COUNT = 48

function Waveform({ analyser, color }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height
    const gap = 3
    const barW = (W - gap * (BAR_COUNT - 1)) / BAR_COUNT

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      for (let i = 0; i < BAR_COUNT; i++) {
        const x = i * (barW + gap)
        let barH, alpha
        if (analyser) {
          const data = new Uint8Array(analyser.frequencyBinCount)
          analyser.getByteFrequencyData(data)
          const norm = data[Math.floor((i / BAR_COUNT) * data.length)] / 255
          barH = Math.max(4, norm * H * 0.85)
          alpha = 0.4 + norm * 0.6
        } else {
          const t = Date.now() / 900
          barH = 4 + Math.abs(Math.sin(i * 0.38 + t)) * 7
          alpha = 0.22
        }
        const y = (H - barH) / 2
        ctx.globalAlpha = alpha
        ctx.fillStyle = color
        ctx.fillRect(x, y, barW, barH)
      }
      ctx.globalAlpha = 1
      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [analyser, color])

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={200}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}

function ModeHeader({ config, mode, onBack, title }) {
  const isVoiceover = mode === 'voiceover'
  return (
    <header className="px-6 py-4" style={{ backgroundColor: config.headerColor }}>
      <div className="max-w-2xl mx-auto flex items-center gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <div className="flex items-center gap-2.5">
          {title ? (
            <span className="text-lg font-extrabold tracking-tight text-white">{title}</span>
          ) : (
            <>
              {isVoiceover ? (
                <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
                  <rect x="5" y="1" width="8" height="12" rx="4" fill="white" />
                  <path d="M1 10c0 4.418 3.582 8 8 8s8-3.582 8-8" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="9" y1="18" x2="9" y2="20" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              ) : (
                <span className="text-xl">{config.emoji}</span>
              )}
              <span className="text-lg font-extrabold tracking-tight text-white">{config.label}</span>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

function SelectScreen({ config, mode, onRecord, onUpload, navigate }) {
  return (
    <div className="min-h-screen font-sans flex flex-col" style={{ backgroundColor: config.pageBg }}>
      <ModeHeader config={config} mode={mode} onBack={() => navigate(`/collection/${mode}`)} />

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 flex flex-col items-center justify-center gap-6">
        <div className="text-center mb-4">
          <p className="text-2xl font-extrabold text-ink mb-2">How do you want to start?</p>
          <p className="text-sm text-ink-light">Choose to record a new take or upload an existing file.</p>
        </div>

        <div className="w-full flex flex-col gap-4">
          <button
            onClick={onRecord}
            className="w-full flex items-center gap-5 bg-white rounded-2xl border-2 p-6 text-left transition-all duration-150 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            style={{ borderColor: config.color + 'aa' }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: config.color + '18' }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="5" fill={config.color} />
                <circle cx="11" cy="11" r="9" stroke={config.color} strokeWidth="1.8" />
              </svg>
            </div>
            <div>
              <p className="text-base font-bold text-ink">Record Now</p>
              <p className="text-sm text-ink-light mt-0.5">Use your camera or mic to record a new take.</p>
            </div>
          </button>

          <button
            onClick={onUpload}
            className="w-full flex items-center gap-5 bg-white rounded-2xl border-2 p-6 text-left transition-all duration-150 hover:scale-[1.01] active:scale-[0.99] cursor-pointer opacity-60"
            style={{ borderColor: config.color + '55' }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: config.color + '10' }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 14V4M11 4L7 8M11 4l4 4" stroke={config.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 16v1a2 2 0 002 2h10a2 2 0 002-2v-1" stroke={config.color} strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-base font-bold text-ink">Upload</p>
              <p className="text-sm text-ink-light mt-0.5">Upload an existing recording to review. <span className="italic">Coming soon.</span></p>
            </div>
          </button>
        </div>
      </main>
    </div>
  )
}

const RATING_OPTIONS = ['Good', 'OK', 'Poor']

const ratingQuestions = {
  voiceover: [
    { key: 'q1', label: 'Clarity' },
    { key: 'q2', label: 'Enthusiasm' },
    { key: 'q3', label: 'Pacing feel' },
  ],
  default: [
    { key: 'q1', label: 'Eye contact' },
    { key: 'q2', label: 'Posture' },
    { key: 'q3', label: 'Expression' },
  ],
}

function RatingScreen({ config, mode, onSubmit, onSkip }) {
  const questions = ratingQuestions[mode] ?? ratingQuestions.default
  const [answers, setAnswers] = useState({})
  const allAnswered = questions.every(q => answers[q.key])

  const handleSubmit = () => {
    const summary = questions.map(q => `${q.label.toLowerCase()} [${answers[q.key]}]`).join(', ')
    onSubmit(summary)
  }

  return (
    <div className="min-h-screen font-sans flex flex-col" style={{ backgroundColor: config.pageBg }}>
      <ModeHeader config={config} mode={mode} title="Self-check" />

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-8 flex flex-col gap-5">
        <div className="mt-4">
          <h2 className="text-xl font-extrabold text-ink mb-1">Quick self-check</h2>
          <p className="text-sm text-ink-light leading-relaxed">
            Rate yourself honestly — your AI coach uses this to give you real, specific feedback.
          </p>
        </div>

        {questions.map(q => (
          <div key={q.key} className="bg-white rounded-2xl p-5 border" style={{ borderColor: config.color + '33' }}>
            <p className="text-sm font-bold text-ink mb-3">{q.label}</p>
            <div className="flex gap-2">
              {RATING_OPTIONS.map(opt => {
                const val = opt.toLowerCase()
                const selected = answers[q.key] === val
                return (
                  <button
                    key={opt}
                    onClick={() => setAnswers(a => ({ ...a, [q.key]: val }))}
                    className="flex-1 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer border-2"
                    style={{
                      backgroundColor: selected ? config.color : 'transparent',
                      borderColor: selected ? config.color : config.color + '44',
                      color: selected ? 'white' : config.color,
                    }}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        <div className="flex flex-col gap-3 mt-2 pb-4">
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="w-full py-4 rounded-full font-bold text-sm text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            style={{ backgroundColor: config.color }}
          >
            Analyze my take →
          </button>
          <button
            onClick={onSkip}
            className="w-full py-3 text-sm font-semibold transition-all cursor-pointer active:opacity-70"
            style={{ color: config.color }}
          >
            Skip — just save it
          </button>
        </div>
      </main>
    </div>
  )
}

const ANALYZING_MSGS = [
  'Reviewing your performance…',
  'Counting those filler words…',
  'Calibrating the roast…',
  'Checking your energy…',
  'Almost ready…',
]

function AnalyzingScreen({ config }) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % ANALYZING_MSGS.length), 1800)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="min-h-screen font-sans flex flex-col items-center justify-center gap-6 px-8" style={{ backgroundColor: config.pageBg }}>
      <div
        className="w-16 h-16 rounded-full border-4 animate-spin"
        style={{ borderColor: config.color + '30', borderTopColor: config.color }}
      />
      <div className="text-center">
        <p className="text-base font-semibold text-ink">{ANALYZING_MSGS[idx]}</p>
        <p className="text-sm text-ink-light mt-1">Your AI coach is watching 👀</p>
      </div>
    </div>
  )
}

function RecordScreen({ config, mode, onBack, onSave }) {
  const isVoiceover = mode === 'voiceover'

  const [prompt, setPrompt] = useState(() => randomPrompt(mode, null))
  const [camError, setCamError] = useState(null)
  const [audioError, setAudioError] = useState(null)
  const [shuffleHover, setShuffleHover] = useState(false)
  const [shuffleActive, setShuffleActive] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [recording, setRecording] = useState(false)
  const [analyser, setAnalyser] = useState(null)
  const [recordedUrl, setRecordedUrl] = useState(null)
  const [recordedMime, setRecordedMime] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [cameraReady, setCameraReady] = useState(false)
  const [thumbnail, setThumbnail] = useState(null)
  const [duration, setDuration] = useState(0)

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const audioCtxRef = useRef(null)
  const audioStreamRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const elapsedRef = useRef(0)
  const recognitionRef = useRef(null)
  const transcriptRef = useRef('')

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setCameraReady(false)
  }

  // Initial camera setup
  useEffect(() => {
    if (isVoiceover) return
    let cancelled = false
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(s => {
        if (cancelled) { s.getTracks().forEach(t => t.stop()); return }
        streamRef.current = s
        if (videoRef.current) videoRef.current.srcObject = s
        setCameraReady(true)
      })
      .catch(() => { if (!cancelled) setCamError('Camera access denied. Please allow camera permissions and try again.') })
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }, [isVoiceover])

  // Voiceover recording
  useEffect(() => {
    if (!isVoiceover) return

    if (recording) {
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: false })
        .then(stream => {
          audioStreamRef.current = stream

          const AudioCtx = window.AudioContext || window.webkitAudioContext
          const ctx = new AudioCtx()
          audioCtxRef.current = ctx
          const node = ctx.createAnalyser()
          node.fftSize = 128
          node.smoothingTimeConstant = 0.8
          ctx.createMediaStreamSource(stream).connect(node)
          setAnalyser(node)

          const mimeType = getSupportedMimeType(true)
          const mr = new MediaRecorder(stream, mimeType ? { mimeType } : {})
          chunksRef.current = []
          mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
          mr.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' })
            if (blob.size > 0) {
              setRecordedUrl(URL.createObjectURL(blob))
              setRecordedMime(mr.mimeType)
            }
            setDuration(elapsedRef.current)
          }
          mr.start(200)
          mediaRecorderRef.current = mr
        })
        .catch(() => {
          setAudioError('Microphone access denied. Please allow microphone permissions and try again.')
          setRecording(false)
        })
    } else {
      try {
        if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop()
      } catch (_) {}
      audioStreamRef.current?.getTracks().forEach(t => t.stop())
      audioCtxRef.current?.close()
      audioStreamRef.current = null
      audioCtxRef.current = null
      setAnalyser(null)
    }
  }, [recording, isVoiceover])

  // Timer
  useEffect(() => {
    if (recording) {
      elapsedRef.current = 0
      setElapsed(0)
      timerRef.current = setInterval(() => {
        elapsedRef.current += 1
        setElapsed(s => s + 1)
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [recording])

  // Thumbnail from recorded video
  useEffect(() => {
    if (!recordedUrl || isVoiceover) return
    const vid = document.createElement('video')
    vid.src = recordedUrl
    vid.muted = true
    vid.playsInline = true
    const onSeeked = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 320
      canvas.height = 240
      canvas.getContext('2d').drawImage(vid, 0, 0, 320, 240)
      setThumbnail(canvas.toDataURL('image/jpeg', 0.8))
    }
    vid.addEventListener('loadeddata', () => { vid.currentTime = 0.5 })
    vid.addEventListener('seeked', onSeeked)
    vid.load()
    return () => vid.removeEventListener('seeked', onSeeked)
  }, [recordedUrl, isVoiceover])

  const liveVideoRef = el => {
    videoRef.current = el
    if (el && streamRef.current) el.srcObject = streamRef.current
  }

  const startRecognition = () => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRec) return
    const recognition = new SpeechRec()
    recognition.continuous = true
    recognition.interimResults = false
    recognition.onresult = e => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) transcriptRef.current += ' ' + e.results[i][0].transcript
      }
    }
    recognition.onerror = () => {}
    try { recognition.start() } catch (_) {}
    recognitionRef.current = recognition
  }

  const stopRecognition = () => {
    try { recognitionRef.current?.stop() } catch (_) {}
    recognitionRef.current = null
  }

  const startVideoRecording = () => {
    const stream = streamRef.current
    if (!stream) return
    const mimeType = getSupportedMimeType(false)
    const mr = new MediaRecorder(stream, mimeType ? { mimeType } : {})
    chunksRef.current = []
    mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'video/webm' })
      if (blob.size > 0) {
        setRecordedUrl(URL.createObjectURL(blob))
        setRecordedMime(mr.mimeType)
      }
      setDuration(elapsedRef.current)
      stopCamera()
    }
    mr.start(200)
    mediaRecorderRef.current = mr
  }

  const shuffle = () => setPrompt(p => randomPrompt(mode, p))

  const handleRecord = () => {
    if (recording) {
      setRecording(false)
      stopRecognition()
      if (!isVoiceover) {
        try {
          if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop()
        } catch (_) {}
      }
    } else {
      setNotesOpen(false)
      transcriptRef.current = ''
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl)
        setRecordedUrl(null)
        setRecordedMime('')
        setThumbnail(null)
      }
      if (!isVoiceover) startVideoRecording()
      startRecognition()
      setRecording(true)
    }
  }

  const takeAgain = async () => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl)
    setRecordedUrl(null)
    setRecordedMime('')
    setThumbnail(null)
    setDuration(0)
    setElapsed(0)
    elapsedRef.current = 0
    transcriptRef.current = ''
    if (!isVoiceover) {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        streamRef.current = s
        if (videoRef.current) videoRef.current.srcObject = s
        setCameraReady(true)
        setCamError(null)
      } catch {
        setCamError('Camera access denied. Please allow camera permissions and try again.')
      }
    }
  }

  const handleSave = () => {
    onSave({
      recordedUrl,
      recordedMime,
      thumbnail,
      duration,
      transcript: transcriptRef.current.trim(),
      fillerCounts: countFillerWords(transcriptRef.current),
      wpm: computeWpm(transcriptRef.current, duration),
      prompt,
    })
  }

  return (
    <div className="min-h-screen font-sans flex flex-col" style={{ backgroundColor: config.pageBg }}>
      <ModeHeader config={config} mode={mode} onBack={onBack} />

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-8 flex flex-col gap-6">

        {/* Prompt card */}
        <div className="bg-white rounded-2xl border-2 p-8 mt-10" style={{ borderColor: config.color + 'aa' }}>
          <div className="flex items-start justify-between gap-6">
            <p className="text-base font-semibold text-ink leading-relaxed flex-1">{prompt}</p>
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
          <div
            role="button"
            tabIndex={0}
            onClick={() => setNotesOpen(o => !o)}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setNotesOpen(o => !o)}
            className="flex items-center justify-between px-5 py-3.5 select-none"
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
          </div>
          <div style={{ maxHeight: notesOpen ? '300px' : '0', overflow: 'hidden', transition: 'max-height 250ms ease' }}>
            <div className="px-5 pb-5 pt-1">
              <textarea
                placeholder="Add notes or script..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                onClick={e => e.stopPropagation()}
                rows={5}
                className="w-full resize-none text-sm text-ink leading-relaxed bg-transparent placeholder:text-ink-light font-sans"
                style={{ outline: 'none', boxShadow: 'none', cursor: 'text' }}
              />
            </div>
          </div>
        </div>

        {/* Media area */}
        {recordedUrl ? (
          <div
            className={`flex-1 rounded-2xl overflow-hidden border-2 relative min-h-48 ${isVoiceover ? 'bg-white flex flex-col items-center justify-center' : 'bg-black'}`}
            style={{ borderColor: config.color + '55' }}
          >
            {isVoiceover ? (
              <div className="w-full px-8 flex flex-col items-center gap-4">
                <p className="text-sm font-semibold" style={{ color: config.color }}>Your take is ready</p>
                <audio src={recordedUrl} controls className="w-full" />
              </div>
            ) : (
              <video
                key="playback"
                src={recordedUrl}
                controls
                playsInline
                className="w-full h-full object-contain"
                style={{ maxHeight: '360px' }}
              />
            )}
          </div>
        ) : isVoiceover ? (
          <div
            className="flex-1 rounded-2xl overflow-hidden border-2 relative min-h-48"
            style={{ borderColor: config.color + '55', backgroundColor: config.pageBg }}
          >
            {audioError
              ? <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
                  <p className="text-sm font-medium" style={{ color: config.color }}>{audioError}</p>
                </div>
              : <Waveform analyser={analyser} color={config.color} />
            }
            {recording && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-white text-xs font-semibold tracking-wide">REC</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 rounded-2xl overflow-hidden border border-blush-border bg-[#1a0a07] relative min-h-64">
            {camError
              ? <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
                  <p className="text-sm text-blush-dark">{camError}</p>
                </div>
              : <video key="live" ref={liveVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
            }
            {recording && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-white text-xs font-semibold tracking-wide">REC</span>
              </div>
            )}
          </div>
        )}

        {/* Bottom controls */}
        {recordedUrl ? (
          <div className="flex gap-3 pb-4">
            <button
              onClick={takeAgain}
              className="flex-1 py-3.5 rounded-full border-2 font-semibold text-sm transition-all duration-150 active:scale-95 cursor-pointer"
              style={{ borderColor: config.color, color: config.color }}
            >
              Take Again
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3.5 rounded-full font-semibold text-sm text-white transition-all duration-150 active:scale-95 cursor-pointer"
              style={{ backgroundColor: config.color }}
            >
              Save
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 pb-4">
            {recording && (
              <span className="text-sm font-mono font-semibold tabular-nums" style={{ color: config.color }}>
                {formatTime(elapsed)}
              </span>
            )}
            <button
              onClick={handleRecord}
              disabled={!isVoiceover && !cameraReady && !recording}
              className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-150 hover:scale-110 active:scale-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ backgroundColor: config.color }}
            >
              {recording
                ? <div className="w-6 h-6 bg-white rounded-md" />
                : <div className="w-7 h-7 bg-white rounded-full" />
              }
            </button>
            {!isVoiceover && !cameraReady && !recording && !camError && (
              <p className="text-xs text-ink-light">Starting camera...</p>
            )}
          </div>
        )}

      </main>
    </div>
  )
}

export default function Practice() {
  const { mode } = useParams()
  const navigate = useNavigate()
  const config = modeConfig[mode] ?? modeConfig.creator

  const [screen, setScreen] = useState('select')
  const [pendingTake, setPendingTake] = useState(null)

  const finalizeTake = (aiResult) => {
    const id = Date.now().toString()
    const score = aiResult?.scores?.overall ?? Math.floor(Math.random() * 25) + 65
    addTake(mode, {
      id,
      name: `Take ${getTakes(mode).length + 1}`,
      score,
      favourite: false,
      date: 'Just now',
      videoUrl: pendingTake.recordedUrl,
      mimeType: pendingTake.recordedMime,
      thumbnail: pendingTake.thumbnail,
      duration: pendingTake.duration,
      ...(aiResult && {
        aiScores: aiResult.scores,
        roastFeedback: aiResult.roastFeedback,
        strengths: aiResult.strengths,
        topTip: aiResult.topTip,
      }),
    })
    navigate(`/playback/${mode}/${id}`)
  }

  const handleRecordingSaved = (data) => {
    setPendingTake(data)
    setScreen('rating')
  }

  const handleRatingsSubmit = async (ratingsSummary) => {
    setScreen('analyzing')
    try {
      const aiResult = await analyzeWithAI({
        ...pendingTake,
        ratingsSummary,
        modeLabel: config.label,
        promptText: pendingTake.prompt,
      })
      finalizeTake(aiResult)
    } catch (err) {
      console.error('AI analysis failed:', err)
      finalizeTake(null)
    }
  }

  const handleSkip = () => finalizeTake(null)

  if (screen === 'select') {
    return (
      <SelectScreen
        config={config}
        mode={mode}
        navigate={navigate}
        onRecord={() => setScreen('record')}
        onUpload={() => {}}
      />
    )
  }

  if (screen === 'rating') {
    return (
      <RatingScreen
        config={config}
        mode={mode}
        onSubmit={handleRatingsSubmit}
        onSkip={handleSkip}
      />
    )
  }

  if (screen === 'analyzing') {
    return <AnalyzingScreen config={config} />
  }

  return (
    <RecordScreen
      config={config}
      mode={mode}
      onBack={() => setScreen('select')}
      onSave={handleRecordingSaved}
    />
  )
}
