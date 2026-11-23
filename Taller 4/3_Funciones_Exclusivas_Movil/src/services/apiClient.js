// Cliente fetch para comunicarse con el backend de ClubTrack.
// En la versión móvil Android (Taller 4), soporta conexión al servidor Express en red local
// y cuenta con respaldo autónomo offline para que la APK funcione en cualquier celular sin depender de cables.

import { getConfiguredApiUrl, handleOfflineRequest } from './offlineMobileFallback'

export const API_BASE_URL = getConfiguredApiUrl()

let currentMode = 'online' // 'online' | 'offline'

export function getConnectionMode() {
  return currentMode
}

export class ApiClientError extends Error {
  constructor(message, status, details = null) {
    super(message)
    this.status = status
    this.details = details
  }
}

export async function apiRequest(endpoint, { method = 'GET', body, headers = {} } = {}) {
  const baseUrl = getConfiguredApiUrl()
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }

  if (body !== undefined) {
    config.body = JSON.stringify(body)
  }

  let response
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 2800)
    response = await fetch(`${baseUrl}${endpoint}`, {
      ...config,
      signal: controller.signal,
    })
    clearTimeout(timer)
    currentMode = 'online'
  } catch {
    // Si el servidor Express no está accesible desde el teléfono, usar el motor móvil embebido
    currentMode = 'offline'
    try {
      return handleOfflineRequest(endpoint, { method, body })
    } catch (offlineErr) {
      throw new ApiClientError(
        offlineErr.message || 'Regla de negocio rechazada.',
        offlineErr.status || 422,
        offlineErr.details || null,
      )
    }
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok || payload?.ok === false) {
    const msg = payload?.error || `Error al consultar la API (HTTP ${response.status}).`
    throw new ApiClientError(msg, response.status, payload?.details || null)
  }

  return payload?.data !== undefined ? payload.data : payload
}
