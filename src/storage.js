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
  try {
    ;['mdc_v3', 'mdc_v2', 'mdc_v1', 'mdc_apikey'].forEach((k) => {
      try { localStorage.removeItem(k) } catch {}
    })
  } catch {}
}

export function getApiKey() {
  try {
    return (
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ANTHROPIC_API_KEY) ||
      localStorage.getItem('mdc_apikey') ||
      ''
    )
  } catch {
    return ''
  }
}

export function saveApiKey(key) {
  try { localStorage.setItem('mdc_apikey', key) } catch {}
}
