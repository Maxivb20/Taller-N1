// Cliente fetch para comunicarse con el backend de ClubTrack.

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export class ApiClientError extends Error {
  constructor(message, status, details = null) {
    super(message)
    this.status = status
    this.details = details
  }
}

export async function apiRequest(endpoint, { method = 'GET', body, headers = {} } = {}) {
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
    response = await fetch(`${API_BASE_URL}${endpoint}`, config)
  } catch {
    throw new ApiClientError(
      'No se pudo conectar con el backend. Revisa que el servidor esté corriendo en el puerto 4000.',
      0,
    )
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok || payload?.ok === false) {
    const msg = payload?.error || `Error al consultar la API (HTTP ${response.status}).`
    throw new ApiClientError(msg, response.status, payload?.details || null)
  }

  return payload?.data !== undefined ? payload.data : payload
}
