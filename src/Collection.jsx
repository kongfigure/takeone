import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTakes, updateTake, subscribe } from './store.js'


const modeConfig = {
  creator:   { label: 'Creator',   emoji: '🎥', color: '#D4687A', headerColor: '#DC8595', pageBg: '#FFF0F3' },
  interview: { label: 'Interview', emoji: '💼', color: '#4a6594', headerColor: '#849EC0', pageBg: '#EEF2F8' },
  voiceover: { label: 'Voiceover', emoji: '🎙️', color: '#8b76b8', headerColor: '#B2A4D2', pageBg: '#F2EEFF' },
}

const TABS = ['All', 'Favourites', 'Strong Takes', 'Needs Work']


function scoreColor(score) {
  if (score >= 80) return '#16a34a'
  if (score >= 70) return '#d97706'
  return '#dc2626'
}

function filterTakes(takes, tab) {
  if (tab === 'Favourites')   return takes.filter(t => t.favourite)
  if (tab === 'Strong Takes') return takes.filter(t => t.score >= 80)
  if (tab === 'Needs Work')   return takes.filter(t => t.score < 70)
  return takes
}

function ThumbnailPlaceholder({ config, mode }) {
  const isVoiceover = mode === 'voiceover'
  return (
    <div
      className="w-full aspect-square flex items-center justify-center"
      style={{ background: `linear-gradient(135deg, ${config.color}18 0%, ${config.color}38 100%)` }}
    >
      {isVoiceover ? (
        <svg width="38" height="38" viewBox="0 0 38 38" fill="none" opacity="0.45">
          <rect x="11" y="2" width="16" height="22" rx="8" fill={config.color} />
          <path d="M5 19c0 7.732 6.268 14 14 14s14-6.268 14-14" stroke={config.color} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="19" y1="33" x2="19" y2="38" stroke={config.color} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="38" height="38" viewBox="0 0 38 38" fill="none" opacity="0.45">
          <rect x="2" y="9" width="25" height="20" rx="3.5" fill={config.color} />
          <path d="M27 15.5l9-4.5v16l-9-4.5V15.5z" fill={config.color} />
          <circle cx="14.5" cy="19" r="4.5" fill="white" opacity="0.55" />
        </svg>
      )}
    </div>
  )
}

function PolaroidCard({ take, config, mode, onToggleFavourite, onRename, onClick }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(take.name)

  const commit = () => {
    setEditing(false)
    if (draft.trim()) onRename(take.id, draft.trim())
    else setDraft(take.name)
  }

  return (
    <div
      className="bg-white flex flex-col overflow-hidden cursor-pointer"
      style={{
        borderRadius: '4px',
        boxShadow: '0 2px 14px rgba(0,0,0,0.09), 0 1px 3px rgba(0,0,0,0.07)',
        border: '1px solid rgba(0,0,0,0.06)',
      }}
      onClick={onClick}
    >
      {mode === 'voiceover' ? (
        <div
          className="w-full flex items-center justify-center gap-0.5 px-3"
          style={{ height: '52px', background: `linear-gradient(135deg, ${config.color}18 0%, ${config.color}30 100%)` }}
        >
          {[0.4, 0.7, 1, 0.65, 0.9, 0.5, 0.8, 0.45, 0.75, 1, 0.6, 0.85].map((h, i) => (
            <div
              key={i}
              className="rounded-full"
              style={{ width: '3px', height: `${h * 28}px`, backgroundColor: config.color, opacity: 0.5 }}
            />
          ))}
        </div>
      ) : take.thumbnail ? (
        <img src={take.thumbnail} alt="" className="w-full aspect-square object-cover" />
      ) : (
        <ThumbnailPlaceholder config={config} mode={mode} />
      )}

      <div className={`flex flex-col gap-1.5 ${mode === 'voiceover' ? 'px-3 pt-3 pb-4' : 'px-2 pt-2 pb-3'}`}>
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            onClick={e => e.stopPropagation()}
            onKeyDown={e => {
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') { setDraft(take.name); setEditing(false) }
            }}
            className="text-sm font-semibold text-ink w-full border-b bg-transparent"
            style={{ outline: 'none', borderColor: config.color }}
          />
        ) : (
          <p
            className={`font-semibold text-ink truncate cursor-text leading-snug ${mode === 'voiceover' ? 'text-sm' : 'text-xs'}`}
            onClick={e => { e.stopPropagation(); setEditing(true) }}
            title="Click to rename"
          >
            {take.name}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full text-white tabular-nums"
              style={{ backgroundColor: scoreColor(take.score) }}
            >
              {take.score}
            </span>
            <span className="text-xs text-ink-light">{take.date}</span>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onToggleFavourite(take.id) }}
            className="w-7 h-7 flex items-center justify-center cursor-pointer rounded-full transition-colors"
            style={{ backgroundColor: take.favourite ? config.color + '18' : 'transparent' }}
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill={take.favourite ? config.color : 'none'} stroke={config.color} strokeWidth="1.5">
              <path d="M8 13.7C8 13.7 1.5 9.5 1.5 5.5C1.5 3.567 3.067 2 5 2C6.1 2 7.1 2.533 7.8 3.367L8 3.633L8.2 3.367C8.9 2.533 9.9 2 11 2C12.933 2 14.5 3.567 14.5 5.5C14.5 9.5 8 13.7 8 13.7Z" />
            </svg>
          </button>
        </div>

        <span
          className="self-start text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: config.color + '18', color: config.color }}
        >
          {config.label}
        </span>
      </div>
    </div>
  )
}

function EmptyState({ tab, config, mode, onRecord, onUpload, totalCount }) {
  if (totalCount > 0) {
    const hint = {
      Favourites:   'Heart a take to save it here.',
      'Strong Takes': 'Takes scoring 80+ will show up here.',
      'Needs Work': 'Takes scoring below 70 will show up here.',
    }[tab] ?? ''
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-8 text-center">
        <p className="text-3xl mb-3">🔍</p>
        <p className="text-base font-semibold text-ink mb-1">Nothing here yet</p>
        <p className="text-sm text-ink-light">{hint}</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 px-8 text-center gap-6">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ backgroundColor: config.color + '18' }}
      >
        <span className="text-4xl">{config.emoji}</span>
      </div>
      <div>
        <p className="text-xl font-extrabold text-ink mb-2">No takes yet</p>
        <p className="text-sm text-ink-light leading-relaxed">
          This is where your {config.label.toLowerCase()} takes will live.<br />
          Start recording and watch your confidence grow.
        </p>
      </div>
      <div className="flex flex-col w-full max-w-xs gap-3">
        <button
          onClick={onRecord}
          className="w-full py-3.5 rounded-full font-semibold text-sm text-white transition-all active:scale-95 cursor-pointer"
          style={{ backgroundColor: config.color }}
        >
          Record your first take
        </button>
        <button
          onClick={onUpload}
          className="w-full py-3.5 rounded-full font-semibold text-sm border-2 transition-all active:scale-95 cursor-pointer"
          style={{ borderColor: config.color, color: config.color }}
        >
          Upload a video
        </button>
      </div>
    </div>
  )
}

function FAB({ config, open, onToggle, onRecord, onUpload }) {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50">
      {open && (
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={onUpload}
            className="flex items-center gap-2 bg-white rounded-full px-4 py-2.5 shadow-lg text-sm font-semibold border cursor-pointer transition-all active:scale-95"
            style={{ borderColor: config.color + '55', color: config.color }}
          >
            <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
              <path d="M11 14V4M11 4L7 8M11 4l4 4" stroke={config.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 16v1a2 2 0 002 2h10a2 2 0 002-2v-1" stroke={config.color} strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Upload
          </button>
          <button
            onClick={onRecord}
            className="flex items-center gap-2 bg-white rounded-full px-4 py-2.5 shadow-lg text-sm font-semibold border cursor-pointer transition-all active:scale-95"
            style={{ borderColor: config.color + '55', color: config.color }}
          >
            <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="5" fill={config.color} />
              <circle cx="11" cy="11" r="9" stroke={config.color} strokeWidth="1.8" />
            </svg>
            Record
          </button>
        </div>
      )}
      <button
        onClick={onToggle}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl cursor-pointer transition-all active:scale-90 hover:scale-105"
        style={{ backgroundColor: config.color }}
      >
        <svg
          width="20" height="20" viewBox="0 0 20 20" fill="none"
          style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 200ms ease' }}
        >
          <path d="M10 4v12M4 10h12" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

export default function Collection() {
  const { mode } = useParams()
  const navigate = useNavigate()
  const config = modeConfig[mode] ?? modeConfig.creator
  const isVoiceover = mode === 'voiceover'

  const [takes, setTakes] = useState(() => getTakes(mode))
  const [activeTab, setActiveTab] = useState('All')
  const [fabOpen, setFabOpen] = useState(false)

  useEffect(() => {
    setTakes(getTakes(mode))
    return subscribe(() => setTakes([...getTakes(mode)]))
  }, [mode])

  const filtered = filterTakes(takes, activeTab)

  const toggleFavourite = id => {
    const take = takes.find(t => t.id === id)
    if (take) updateTake(mode, id, { favourite: !take.favourite })
  }

  const rename = (id, name) => updateTake(mode, id, { name })

  const uploadInputRef = useRef(null)

  const goRecord = () => navigate(`/practice/${mode}`)
  const goUpload = () => uploadInputRef.current?.click()

  const tabCount = tab => filterTakes(takes, tab).length

  return (
    <div
      className="min-h-screen font-sans flex flex-col"
      style={{ backgroundColor: config.pageBg }}
      onClick={() => fabOpen && setFabOpen(false)}
    >
      <input
        type="file"
        accept="video/*,audio/*"
        ref={uploadInputRef}
        style={{ display: 'none' }}
        onChange={e => {
          const file = e.target.files[0]
          e.target.value = ''
          if (file) navigate(`/practice/${mode}`, { state: { uploadFile: file } })
        }}
      />

      {/* Header */}
      <header className="px-6 py-4" style={{ backgroundColor: config.headerColor }}>
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 cursor-pointer"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="flex items-center gap-2.5">
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
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-black/5 bg-white/60 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 flex gap-1.5 overflow-x-auto py-2.5" style={{ scrollbarWidth: 'none' }}>
          {TABS.map(tab => {
            const count = tabCount(tab)
            const active = tab === activeTab
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all cursor-pointer"
                style={{
                  backgroundColor: active ? config.color : 'transparent',
                  color: active ? 'white' : config.color,
                  border: `1.5px solid ${active ? config.color : config.color + '55'}`,
                }}
              >
                {tab}
                {count > 0 && (
                  <span
                    className="text-xs font-bold min-w-[18px] text-center rounded-full px-1"
                    style={{
                      backgroundColor: active ? 'rgba(255,255,255,0.25)' : config.color + '18',
                      color: active ? 'white' : config.color,
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 w-full px-6 py-6 flex flex-col">
        {filtered.length === 0 ? (
          <EmptyState
            tab={activeTab}
            config={config}
            mode={mode}
            onRecord={goRecord}
            onUpload={goUpload}
            totalCount={takes.length}
          />
        ) : (
          <div className={`grid gap-4 ${mode === 'voiceover' ? 'grid-cols-3' : 'grid-cols-5'}`}>
            {filtered.map(take => (
              <PolaroidCard
                key={take.id}
                take={take}
                config={config}
                mode={mode}
                onToggleFavourite={toggleFavourite}
                onRename={rename}
                onClick={() => navigate(`/playback/${mode}/${take.id}`)}
              />
            ))}
          </div>
        )}
      </main>

      <FAB
        config={config}
        open={fabOpen}
        onToggle={e => { e.stopPropagation(); setFabOpen(o => !o) }}
        onRecord={goRecord}
        onUpload={goUpload}
      />
    </div>
  )
}
