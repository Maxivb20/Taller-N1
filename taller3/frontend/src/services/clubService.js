// Llamadas HTTP a la API del club (reemplaza el uso de localStorage del Taller 2).

import { apiRequest } from './apiClient'

export const clubApi = {
  obtenerBootstrap: () => apiRequest('/bootstrap'),
  reiniciarDatos: () => apiRequest('/reset', { method: 'POST' }),

  listarSocios: () => apiRequest('/socios'),
  obtenerSocioDetalle: (id) => apiRequest(`/socios/${id}`),
  crearSocio: (datos) => apiRequest('/socios', { method: 'POST', body: datos }),
  editarSocio: (id, datos) => apiRequest(`/socios/${id}`, { method: 'PUT', body: datos }),
  eliminarSocio: (id) => apiRequest(`/socios/${id}`, { method: 'DELETE' }),

  listarInstructores: () => apiRequest('/instructores'),
  crearInstructor: (datos) => apiRequest('/instructores', { method: 'POST', body: datos }),
  editarInstructor: (id, datos) => apiRequest(`/instructores/${id}`, { method: 'PUT', body: datos }),
  eliminarInstructor: (id) => apiRequest(`/instructores/${id}`, { method: 'DELETE' }),

  listarPlanes: () => apiRequest('/planes'),
  crearPlan: (datos) => apiRequest('/planes', { method: 'POST', body: datos }),
  editarPlan: (id, datos) => apiRequest(`/planes/${id}`, { method: 'PUT', body: datos }),
  eliminarPlan: (id) => apiRequest(`/planes/${id}`, { method: 'DELETE' }),

  listarActividades: () => apiRequest('/actividades'),
  crearActividad: (datos) => apiRequest('/actividades', { method: 'POST', body: datos }),
  editarActividad: (id, datos) => apiRequest(`/actividades/${id}`, { method: 'PUT', body: datos }),
  eliminarActividad: (id) => apiRequest(`/actividades/${id}`, { method: 'DELETE' }),

  listarMembresias: () => apiRequest('/membresias'),
  crearMembresia: (datos) => apiRequest('/membresias', { method: 'POST', body: datos }),
  renovarMembresia: (id) => apiRequest(`/membresias/${id}/renovar`, { method: 'POST' }),

  listarInscripciones: () => apiRequest('/inscripciones'),
  crearInscripcion: (datos) => apiRequest('/inscripciones', { method: 'POST', body: datos }),
  cambiarEstadoInscripcion: (id, estado) =>
    apiRequest(`/inscripciones/${id}/estado`, { method: 'PATCH', body: { estado } }),
  eliminarInscripcion: (id) => apiRequest(`/inscripciones/${id}`, { method: 'DELETE' }),

  listarPagos: () => apiRequest('/pagos'),
  crearPago: (datos) => apiRequest('/pagos', { method: 'POST', body: datos }),
  marcarPagado: (id, metodo) =>
    apiRequest(`/pagos/${id}/pagar`, { method: 'PATCH', body: metodo ? { metodo } : {} }),

  listarAsistencias: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return apiRequest(`/asistencias${qs ? `?${qs}` : ''}`)
  },
  registrarCheckin: ({ codigo, socioId, actividadId, metodo }) =>
    apiRequest('/asistencias/checkin', {
      method: 'POST',
      body: { codigo: codigo || socioId, actividadId, metodo },
    }),
  listarBitacora: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return apiRequest(`/bitacora${qs ? `?${qs}` : ''}`)
  },
}
