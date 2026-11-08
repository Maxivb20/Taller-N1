// Validaciones de datos de entrada para los endpoints del backend.

export class AppError extends Error {
  constructor(message, statusCode = 400, details = null) {
    super(message)
    this.statusCode = statusCode
    this.details = details
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export function validateSocioDTO(body) {
  const nombre = String(body?.nombre || '').trim()
  const email = String(body?.email || '').trim().toLowerCase()
  const telefono = String(body?.telefono || '').trim()

  if (nombre.length < 3) {
    throw new AppError('El nombre debe tener al menos 3 caracteres.', 400)
  }
  if (!EMAIL_RE.test(email)) {
    throw new AppError('Ingresa un correo electrónico válido.', 400)
  }
  if (telefono.length < 8) {
    throw new AppError('Ingresa un teléfono de contacto válido.', 400)
  }
  return { nombre, email, telefono }
}

export function validatePlanDTO(body) {
  const nombre = String(body?.nombre || '').trim()
  const descripcion = String(body?.descripcion || '').trim()
  const precio = Number(body?.precio)
  const duracionDias = Number(body?.duracionDias || 30)
  let actividades = body?.actividades || []
  if (typeof actividades === 'string') {
    actividades = actividades
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }

  if (nombre.length < 3) {
    throw new AppError('El nombre del plan debe tener al menos 3 caracteres.', 400)
  }
  if (!Number.isFinite(precio) || precio <= 0) {
    throw new AppError('El precio debe ser un número mayor a 0.', 400)
  }
  if (!Number.isFinite(duracionDias) || duracionDias <= 0) {
    throw new AppError('La duración en días debe ser mayor a 0.', 400)
  }
  return { nombre, descripcion, precio: Math.round(precio), duracionDias: Math.round(duracionDias), actividades }
}

export function validateInstructorDTO(body) {
  const nombre = String(body?.nombre || '').trim()
  const especialidad = String(body?.especialidad || '').trim()
  const email = String(body?.email || '').trim().toLowerCase()
  const telefono = String(body?.telefono || '').trim()
  const bio = String(body?.bio || '').trim()
  const activo = body?.activo !== undefined ? Boolean(body.activo) : true

  if (nombre.length < 3) {
    throw new AppError('El nombre del instructor debe tener al menos 3 caracteres.', 400)
  }
  if (especialidad.length < 3) {
    throw new AppError('La especialidad es obligatoria.', 400)
  }
  if (!EMAIL_RE.test(email)) {
    throw new AppError('Ingresa un correo válido.', 400)
  }
  if (telefono.length < 8) {
    throw new AppError('Ingresa un teléfono válido.', 400)
  }
  return { nombre, especialidad, email, telefono, bio, activo }
}

export function validateActividadDTO(body) {
  const nombre = String(body?.nombre || '').trim()
  const categoria = String(body?.categoria || 'Fitness').trim()
  const instructorId = body?.instructorId ? String(body.instructorId).trim() : null
  const instructor = String(body?.instructor || 'Staff de sala').trim()
  const horario = String(body?.horario || '').trim()
  const ubicacion = String(body?.ubicacion || 'Sala Principal').trim()
  const cupo = Number(body?.cupo)
  const exterior = Boolean(body?.exterior)
  const publicada = body?.publicada !== undefined ? Boolean(body.publicada) : true

  if (nombre.length < 3) {
    throw new AppError('El nombre de la actividad debe tener al menos 3 caracteres.', 400)
  }
  if (!Number.isFinite(cupo) || cupo <= 0) {
    throw new AppError('El cupo debe ser mayor a 0.', 400)
  }
  return {
    nombre,
    categoria: categoria || 'Fitness',
    instructorId,
    instructor: instructor || 'Staff de sala',
    horario: horario || 'Por definir',
    ubicacion: ubicacion || 'Sala Principal',
    cupo: Math.round(cupo),
    exterior,
    publicada,
  }
}

export function validateMembresiaDTO(body) {
  const socioId = String(body?.socioId || '').trim()
  const planId = String(body?.planId || '').trim()
  const inicio = String(body?.inicio || body?.fechaInicio || '').trim()
  const actividadPreferida = body?.actividadPreferida ? String(body.actividadPreferida).trim() : null

  if (!socioId) throw new AppError('Debes seleccionar un socio.', 400)
  if (!planId) throw new AppError('Debes seleccionar un plan.', 400)
  if (inicio && !DATE_RE.test(inicio)) {
    throw new AppError('La fecha de inicio debe tener formato YYYY-MM-DD.', 400)
  }
  return { socioId, planId, inicio, actividadPreferida }
}

export function validateInscripcionDTO(body) {
  const socioId = String(body?.socioId || '').trim()
  const actividadId = String(body?.actividadId || '').trim()
  const notas = String(body?.notas || '').trim()

  if (!socioId) throw new AppError('Selecciona un socio.', 400)
  if (!actividadId) throw new AppError('Selecciona una actividad.', 400)
  return { socioId, actividadId, notas }
}

export function validatePagoDTO(body) {
  const socioId = String(body?.socioId || '').trim()
  const membresiaId = body?.membresiaId ? String(body.membresiaId).trim() : null
  const monto = Number(body?.monto)
  const metodo = String(body?.metodo || 'Efectivo').trim()
  const estado = body?.estado === 'pendiente' ? 'pendiente' : 'pagado'

  if (!socioId) throw new AppError('Selecciona un socio.', 400)
  if (!Number.isFinite(monto) || monto <= 0) {
    throw new AppError('El monto debe ser mayor a 0.', 400)
  }
  return { socioId, membresiaId, monto: Math.round(monto), metodo, estado }
}

export function validateCheckinDTO(body) {
  const codigo = String(body?.codigo || body?.socioId || '').trim()
  const actividadId = body?.actividadId ? String(body.actividadId).trim() : null
  const metodo = body?.metodo === 'Manual' ? 'Manual' : 'QR'

  if (!codigo) {
    throw new AppError('Ingresa el código del socio.', 400)
  }
  return { codigo, actividadId, metodo }
}
