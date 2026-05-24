// In-memory store for takes. Blob URLs are valid for the current session only.

const seed = {
  creator: [
    { id: 'c1', name: 'Channel intro',   score: 85, favourite: true,  date: 'Today',     videoUrl: null, mimeType: '' },
    { id: 'c2', name: 'Morning routine', score: 72, favourite: false, date: 'Yesterday', videoUrl: null, mimeType: '' },
    { id: 'c3', name: 'Trend reaction',  score: 61, favourite: false, date: 'May 20',    videoUrl: null, mimeType: '' },
  ],
  interview: [
    { id: 'i1', name: 'Tell me about yourself', score: 78, favourite: false, date: 'Today',   videoUrl: null, mimeType: '' },
    { id: 'i2', name: 'Greatest weakness',       score: 91, favourite: true,  date: 'May 21', videoUrl: null, mimeType: '' },
  ],
  voiceover: [
    { id: 'v1', name: 'Transportation future', score: 88, favourite: true, date: 'May 22', videoUrl: null, mimeType: '' },
  ],
}

const state = {
  creator:   [...seed.creator],
  interview: [...seed.interview],
  voiceover: [...seed.voiceover],
}

const listeners = new Set()

function notify() {
  listeners.forEach(fn => fn())
}

export function getTakes(mode) {
  return state[mode] ?? []
}

export function addTake(mode, take) {
  state[mode] = [take, ...(state[mode] ?? [])]
  notify()
}

export function updateTake(mode, id, updates) {
  state[mode] = (state[mode] ?? []).map(t => t.id === id ? { ...t, ...updates } : t)
  notify()
}

export function getTake(mode, id) {
  return (state[mode] ?? []).find(t => t.id === id) ?? null
}

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
