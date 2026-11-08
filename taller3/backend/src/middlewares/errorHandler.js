import { AppError } from '../schemas/validators.js'

export function notFoundHandler(req, res) {
  res.status(404).json({
    ok: false,
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  })
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      ok: false,
      error: err.message,
      details: err.details || undefined,
    })
  }

  // Errores de clave duplicada o restricción foránea en PostgreSQL
  if (err?.code === '23505') {
    return res.status(409).json({
      ok: false,
      error: 'Ya existe un registro con ese correo o identificador único.',
    })
  }
  if (err?.code === '23503') {
    return res.status(409).json({
      ok: false,
      error: 'No se puede completar la operación porque existen registros asociados.',
    })
  }

  console.error('[API Error]', err.message)
  return res.status(500).json({
    ok: false,
    error: 'Ocurrió un error interno en el servidor. Intenta nuevamente.',
  })
}
