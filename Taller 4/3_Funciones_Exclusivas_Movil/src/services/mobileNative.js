// Servicio de funciones nativas exclusivas para la app móvil Android (Taller 4).
// Incluye:
// 1. Vibración háptica diferenciada (autorizado vs denegado vs toque).
// 2. Sonidos sintetizados de control de acceso (tono verde autorizado / alerta roja denegado).
// 3. Acceso a cámara real del dispositivo con soporte de linterna (Flash/Torch) y detección de QR.
// 4. Sensor acelerómetro (Shake / Agitar el teléfono) para actualización o escaneo rápido.

export function isMobileApp() {
  if (typeof window === 'undefined') return false
  const cap = window.Capacitor
  if (cap && typeof cap.isNativePlatform === 'function') {
    return cap.isNativePlatform()
  }
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '')
}

export function vibrateSuccess() {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      // Patrón corto doble de confirmación (éxito)
      navigator.vibrate([70, 50, 110])
    }
  } catch {
    // Ignorar en navegadores de escritorio sin soporte
  }
}

export function vibrateError() {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      // Patrón largo de alerta (acceso rechazado)
      navigator.vibrate([220, 80, 220, 80, 260])
    }
  } catch {
    // Ignorar en navegadores de escritorio sin soporte
  }
}

export function vibrateTap() {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(35)
    }
  } catch {
    // Ignorar
  }
}

export function playAccessTone(authorized = true) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()

    if (authorized) {
      // Doble tono ascendente tipo torniquete aprobado (880Hz -> 1318Hz)
      const now = ctx.currentTime
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(880, now)
      osc1.frequency.setValueAtTime(1318.5, now + 0.11)
      gain1.gain.setValueAtTime(0.18, now)
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28)
      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.start(now)
      osc1.stop(now + 0.29)
    } else {
      // Doble tono grave de rechazo (240Hz -> 180Hz)
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(240, now)
      osc.frequency.setValueAtTime(175, now + 0.16)
      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.39)
    }
  } catch {
    // Ignorar si el audio está silenciado
  }
}

export async function toggleTrackTorch(videoTrack, enabled) {
  if (!videoTrack || typeof videoTrack.applyConstraints !== 'function') {
    return false
  }
  try {
    await videoTrack.applyConstraints({
      advanced: [{ torch: Boolean(enabled) }],
    })
    return true
  } catch {
    return false
  }
}

export async function shareCredential({ socioId, socioNombre, planNombre, estado }) {
  const text = `Credencial Digital ClubTrack\nSocio: ${socioNombre} (${socioId})\nPlan: ${planNombre}\nEstado: ${estado.toUpperCase()}`
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    await navigator.share({
      title: `Credencial ClubTrack · ${socioNombre}`,
      text,
    })
    return true
  }
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(text)
    return true
  }
  return false
}
