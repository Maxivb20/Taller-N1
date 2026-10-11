// Acceso a localStorage centralizado. Toda la persistencia del sistema pasa por aquí.

export const KEYS = {
  db: 'clubtrack_db_v1',
  seeded: 'clubtrack_seeded_v1',
}

export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function removeKey(key) {
  localStorage.removeItem(key)
}
