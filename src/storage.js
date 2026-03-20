import { STORAGE_KEY } from './constants'

export function loadState() {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v ? JSON.parse(v) : null
  } catch {
    return null
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

export function clearState() {
  ;['mdc_v3', 'mdc_v2', 'mdc_v1', 'mdc_apikey'].forEach((k) => {
    try { localStorage.removeItem(k) } catch {}
  })
}

export function getApiKey() {
  return (
    import.meta.env.VITE_ANTHROPIC_API_KEY ||
    localStorage.getItem('mdc_apikey') ||
    ''
  )
}

export function saveApiKey(key) {
  localStorage.setItem('mdc_apikey', key)
}
