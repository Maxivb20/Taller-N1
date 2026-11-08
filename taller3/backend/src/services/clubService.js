import { pool } from '../config/postgres.js'
import { AccessLog } from '../models/AccessLog.js'
import { AuditEvent } from '../models/AuditEvent.js'
import { addDays, nowTime, seedDatabases, today } from '../db/seed.js'
import {
  AppError,
  validateActividadDTO,
  validateCheckinDTO,
  validateInscripcionDTO,
  validateInstructorDTO,
  validateMembresiaDTO,
  validatePagoDTO,
  validatePlanDTO,
  validateSocioDTO,
} from '../schemas/validators.js'

const UMBRAL_POR_VENCER = 7

function uid(prefix) {
  return `${prefix}${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`
}

function generateComprobante() {
  const rnd = Math.floor(1000 + Math.random() * 9000)
  return `BOL-${new Date().getFullYear()}-${rnd}-${Date.now().toString().slice(-3)}`
}

export function diasRestantes(fechaFin) {
  const a = new Date(today() + 'T00:00:00')
  const b = new Date(fechaFin + 'T00:00:00')
  return Math.round((b - a) / 86400000)
}

export function estadoMembresia(fechaFin) {
  const r = diasRestantes(fechaFin)
  if (r < 0) return 'vencida'
  if (r <= UMBRAL_POR_VENCER) return 'por_vencer'
  return 'activa'
}

/* ---------- Mapeadores de filas SQL a camelCase ---------- */
const mapInstructor = (r) => ({
  id: r.id,
  nombre: r.nombre,
  especialidad: r.especialidad,
  email: r.email,
  telefono: r.telefono,
  bio: r.bio || '',
  activo: Boolean(r.activo),
})

const mapSocio = (r) => ({
  id: r.id,
  nombre: r.nombre,
  email: r.email,
  telefono: r.telefono,
  fechaIngreso: r.fecha_ingreso,
})

const mapPlan = (r) => ({
  id: r.id,
  nombre: r.nombre,
  descripcion: r.descripcion || '',
  precio: Number(r.precio),
  duracionDias: Number(r.duracion_dias),
  actividades: Array.isArray(r.actividades) ? r.actividades : [],
})

const mapActividad = (r) => ({
  id: r.id,
  nombre: r.nombre,
  categoria: r.categoria || 'Fitness',
  instructorId: r.instructor_id || null,
  instructor: r.instructor || 'Staff de sala',
  horario: r.horario,
  ubicacion: r.ubicacion || 'Sala Principal',
  cupo: Number(r.cupo),
  exterior: Boolean(r.exterior),
  publicada: r.publicada !== undefined ? Boolean(r.publicada) : true,
})

const mapMembresia = (r) => ({
  id: r.id,
  socioId: r.socio_id,
  planId: r.plan_id,
  fechaInicio: r.fecha_inicio,
  fechaFin: r.fecha_fin,
  actividadPreferida: r.actividad_preferida || null,
})

const mapInscripcion = (r) => ({
  id: r.id,
  socioId: r.socio_id,
  actividadId: r.actividad_id,
  fechaInscripcion: r.fecha_inscripcion,
  estado: r.estado,
  notas: r.notas || '',
})

const mapPago = (r) => ({
  id: r.id,
  socioId: r.socio_id,
  membresiaId: r.membresia_id || null,
  monto: Number(r.monto),
  fecha: r.fecha,
  metodo: r.metodo,
  estado: r.estado,
  comprobante: r.comprobante,
})

const mapAccessLog = (doc) => ({
  id: doc.codigo || String(doc._id),
  socioId: doc.socioId,
  socioNombre: doc.socioNombre,
  actividadId: doc.actividadId,
  actividadNombre: doc.actividadNombre,
  fecha: doc.fecha,
  hora: doc.hora,
  metodo: doc.metodo,
  autorizado: doc.autorizado,
  motivo: doc.motivo,
  metadata: doc.metadata || {},
})

const mapAuditEvent = (doc) => ({
  id: String(doc._id),
  tipo: doc.tipo,
  modulo: doc.modulo,
  descripcion: doc.descripcion,
  actor: doc.actor,
  entidadId: doc.entidadId,
  socioId: doc.socioId,
  payload: doc.payload || {},
  fecha: doc.fecha,
  hora: doc.hora,
})

async function registrarEventoNoSQL({ tipo, modulo, descripcion, entidadId = null, socioId = null, payload = {} }) {
  try {
    await AuditEvent.create({
      tipo,
      modulo,
      descripcion,
      actor: 'Admin / Recepción',
      entidadId,
      socioId,
      payload,
      fecha: today(),
      hora: nowTime(),
    })
  } catch (err) {
    console.error('[MongoDB Audit Error]', err.message)
  }
}

/* =========================================================
   OPERACIONES DE CONSULTA GLOBAL (Bootstrap / Estado)
   ========================================================= */
export async function obtenerEstadoCompleto() {
  const [
    instructoresRes,
    sociosRes,
    planesRes,
    actividadesRes,
    membresiasRes,
    inscripcionesRes,
    pagosRes,
    accessLogsDocs,
    auditDocs,
  ] = await Promise.all([
    pool.query('SELECT * FROM instructores ORDER BY id ASC'),
    pool.query('SELECT * FROM socios ORDER BY id ASC'),
    pool.query('SELECT * FROM planes ORDER BY precio ASC'),
    pool.query('SELECT * FROM actividades ORDER BY id ASC'),
    pool.query('SELECT * FROM membresias ORDER BY fecha_fin ASC'),
    pool.query('SELECT * FROM inscripciones ORDER BY fecha_inscripcion DESC, created_at DESC'),
    pool.query('SELECT * FROM pagos ORDER BY fecha DESC, created_at DESC'),
    AccessLog.find({}).sort({ fecha: -1, hora: -1, createdAt: -1 }).limit(200).lean(),
    AuditEvent.find({}).sort({ createdAt: -1 }).limit(100).lean(),
  ])

  const todosLogs = accessLogsDocs.map(mapAccessLog)
  // Asistencias efectivas (check-ins autorizados) para métricas e historial tradicional
  const asistencias = todosLogs.filter((l) => l.autorizado)

  return {
    instructores: instructoresRes.rows.map(mapInstructor),
    socios: sociosRes.rows.map(mapSocio),
    planes: planesRes.rows.map(mapPlan),
    actividades: actividadesRes.rows.map(mapActividad),
    membresias: membresiasRes.rows.map(mapMembresia),
    inscripciones: inscripcionesRes.rows.map(mapInscripcion),
    pagos: pagosRes.rows.map(mapPago),
    asistencias,
    accessLogs: todosLogs,
    bitacora: auditDocs.map(mapAuditEvent),
  }
}

/* =========================================================
   SOCIOS (PostgreSQL + Auditoría MongoDB)
   ========================================================= */
export async function listarSocios() {
  const { rows } = await pool.query('SELECT * FROM socios ORDER BY id ASC')
  return rows.map(mapSocio)
}

export async function obtenerSocioDetalle(id) {
  const { rows } = await pool.query('SELECT * FROM socios WHERE id = $1', [id])
  if (rows.length === 0) throw new AppError('Socio no encontrado.', 404)
  const socio = mapSocio(rows[0])

  const [memsRes, pagosRes, inscRes, logsDocs, auditDocs] = await Promise.all([
    pool.query('SELECT * FROM membresias WHERE socio_id = $1 ORDER BY fecha_inicio DESC', [id]),
    pool.query('SELECT * FROM pagos WHERE socio_id = $1 ORDER BY fecha DESC', [id]),
    pool.query('SELECT * FROM inscripciones WHERE socio_id = $1 ORDER BY fecha_inscripcion DESC', [id]),
    AccessLog.find({ socioId: id }).sort({ fecha: -1, hora: -1 }).lean(),
    AuditEvent.find({ socioId: id }).sort({ createdAt: -1 }).lean(),
  ])

  return {
    ...socio,
    membresias: memsRes.rows.map(mapMembresia),
    pagos: pagosRes.rows.map(mapPago),
    inscripciones: inscRes.rows.map(mapInscripcion),
    asistencias: logsDocs.filter((l) => l.autorizado).map(mapAccessLog),
    accessLogs: logsDocs.map(mapAccessLog),
    bitacora: auditDocs.map(mapAuditEvent),
  }
}

export async function crearSocio(body) {
  const dto = validateSocioDTO(body)
  const id = uid('S')
  const fechaIngreso = today()

  const { rows } = await pool.query(
    `INSERT INTO socios (id, nombre, email, telefono, fecha_ingreso)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [id, dto.nombre, dto.email, dto.telefono, fechaIngreso],
  )
  const nuevo = mapSocio(rows[0])

  await registrarEventoNoSQL({
    tipo: 'SOCIO_CREADO',
    modulo: 'socios',
    descripcion: `Nuevo socio registrado: ${nuevo.nombre} (${nuevo.email}).`,
    entidadId: nuevo.id,
    socioId: nuevo.id,
    payload: nuevo,
  })

  return nuevo
}

export async function actualizarSocio(id, body) {
  const dto = validateSocioDTO(body)
  const { rows } = await pool.query(
    `UPDATE socios
     SET nombre = $1, email = $2, telefono = $3
     WHERE id = $4
     RETURNING *`,
    [dto.nombre, dto.email, dto.telefono, id],
  )
  if (rows.length === 0) throw new AppError('Socio no encontrado.', 404)
  const actualizado = mapSocio(rows[0])

  await registrarEventoNoSQL({
    tipo: 'SOCIO_ACTUALIZADO',
    modulo: 'socios',
    descripcion: `Datos actualizados para el socio ${actualizado.nombre}.`,
    entidadId: actualizado.id,
    socioId: actualizado.id,
    payload: actualizado,
  })

  return actualizado
}

export async function eliminarSocio(id) {
  const { rows } = await pool.query('DELETE FROM socios WHERE id = $1 RETURNING *', [id])
  if (rows.length === 0) throw new AppError('Socio no encontrado.', 404)
  const eliminado = mapSocio(rows[0])

  // Eliminar logs de acceso asociados en MongoDB y registrar evento de baja
  await AccessLog.deleteMany({ socioId: id })
  await registrarEventoNoSQL({
    tipo: 'SOCIO_ELIMINADO',
    modulo: 'socios',
    descripcion: `Socio eliminado en cascada: ${eliminado.nombre} (${eliminado.id}).`,
    entidadId: eliminado.id,
    socioId: eliminado.id,
    payload: { nombre: eliminado.nombre, email: eliminado.email },
  })

  return { deleted: true, id }
}

/* =========================================================
   INSTRUCTORES / ORGANIZADORES (PostgreSQL)
   ========================================================= */
export async function listarInstructores() {
  const { rows } = await pool.query('SELECT * FROM instructores ORDER BY id ASC')
  return rows.map(mapInstructor)
}

export async function crearInstructor(body) {
  const dto = validateInstructorDTO(body)
  const id = uid('I')
  const { rows } = await pool.query(
    `INSERT INTO instructores (id, nombre, especialidad, email, telefono, bio, activo)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [id, dto.nombre, dto.especialidad, dto.email, dto.telefono, dto.bio, dto.activo],
  )
  return mapInstructor(rows[0])
}

export async function actualizarInstructor(id, body) {
  const dto = validateInstructorDTO(body)
  const { rows } = await pool.query(
    `UPDATE instructores
     SET nombre = $1, especialidad = $2, email = $3, telefono = $4, bio = $5, activo = $6
     WHERE id = $7
     RETURNING *`,
    [dto.nombre, dto.especialidad, dto.email, dto.telefono, dto.bio, dto.activo, id],
  )
  if (rows.length === 0) throw new AppError('Instructor no encontrado.', 404)
  return mapInstructor(rows[0])
}

export async function eliminarInstructor(id) {
  const { rows } = await pool.query('DELETE FROM instructores WHERE id = $1 RETURNING *', [id])
  if (rows.length === 0) throw new AppError('Instructor no encontrado.', 404)
  return { deleted: true, id }
}

/* =========================================================
   PLANES (PostgreSQL)
   ========================================================= */
export async function listarPlanes() {
  const { rows } = await pool.query('SELECT * FROM planes ORDER BY precio ASC')
  return rows.map(mapPlan)
}

export async function crearPlan(body) {
  const dto = validatePlanDTO(body)
  const id = uid('P')
  const { rows } = await pool.query(
    `INSERT INTO planes (id, nombre, descripcion, precio, duracion_dias, actividades)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb)
     RETURNING *`,
    [id, dto.nombre, dto.descripcion, dto.precio, dto.duracionDias, JSON.stringify(dto.actividades)],
  )
  return mapPlan(rows[0])
}

export async function actualizarPlan(id, body) {
  const dto = validatePlanDTO(body)
  const { rows } = await pool.query(
    `UPDATE planes
     SET nombre = $1, descripcion = $2, precio = $3, duracion_dias = $4, actividades = $5::jsonb
     WHERE id = $6
     RETURNING *`,
    [dto.nombre, dto.descripcion, dto.precio, dto.duracionDias, JSON.stringify(dto.actividades), id],
  )
  if (rows.length === 0) throw new AppError('Plan no encontrado.', 404)
  return mapPlan(rows[0])
}

export async function eliminarPlan(id) {
  const { rows: mems } = await pool.query('SELECT COUNT(*)::int AS count FROM membresias WHERE plan_id = $1', [id])
  if (mems[0].count > 0) {
    throw new AppError('No se puede eliminar: existen membresías asociadas a este plan.', 409)
  }
  const { rows } = await pool.query('DELETE FROM planes WHERE id = $1 RETURNING *', [id])
  if (rows.length === 0) throw new AppError('Plan no encontrado.', 404)
  return { deleted: true, id }
}

/* =========================================================
   ACTIVIDADES / EVENTOS (PostgreSQL)
   ========================================================= */
export async function listarActividades() {
  const { rows } = await pool.query('SELECT * FROM actividades ORDER BY id ASC')
  return rows.map(mapActividad)
}

export async function crearActividad(body) {
  const dto = validateActividadDTO(body)
  let instructorNombre = dto.instructor
  if (dto.instructorId) {
    const { rows: inst } = await pool.query('SELECT nombre FROM instructores WHERE id = $1', [dto.instructorId])
    if (inst[0]) instructorNombre = inst[0].nombre
  }
  const id = uid('A')
  const { rows } = await pool.query(
    `INSERT INTO actividades (id, nombre, categoria, instructor_id, instructor, horario, ubicacion, cupo, exterior, publicada)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      id,
      dto.nombre,
      dto.categoria,
      dto.instructorId,
      instructorNombre,
      dto.horario,
      dto.ubicacion,
      dto.cupo,
      dto.exterior,
      dto.publicada,
    ],
  )
  return mapActividad(rows[0])
}

export async function actualizarActividad(id, body) {
  const dto = validateActividadDTO(body)
  let instructorNombre = dto.instructor
  if (dto.instructorId) {
    const { rows: inst } = await pool.query('SELECT nombre FROM instructores WHERE id = $1', [dto.instructorId])
    if (inst[0]) instructorNombre = inst[0].nombre
  }
  const { rows } = await pool.query(
    `UPDATE actividades
     SET nombre = $1, categoria = $2, instructor_id = $3, instructor = $4, horario = $5,
         ubicacion = $6, cupo = $7, exterior = $8, publicada = $9
     WHERE id = $10
     RETURNING *`,
    [
      dto.nombre,
      dto.categoria,
      dto.instructorId,
      instructorNombre,
      dto.horario,
      dto.ubicacion,
      dto.cupo,
      dto.exterior,
      dto.publicada,
      id,
    ],
  )
  if (rows.length === 0) throw new AppError('Actividad no encontrada.', 404)
  return mapActividad(rows[0])
}

export async function eliminarActividad(id) {
  const { rows } = await pool.query('DELETE FROM actividades WHERE id = $1 RETURNING *', [id])
  if (rows.length === 0) throw new AppError('Actividad no encontrada.', 404)
  return { deleted: true, id }
}

/* =========================================================
   MEMBRESÍAS (PostgreSQL Transaccional + Auditoría MongoDB)
   ========================================================= */
export async function listarMembresias() {
  const { rows } = await pool.query('SELECT * FROM membresias ORDER BY fecha_fin ASC')
  return rows.map(mapMembresia)
}

export async function crearMembresia(body) {
  const dto = validateMembresiaDTO(body)

  const { rows: socioRows } = await pool.query('SELECT * FROM socios WHERE id = $1', [dto.socioId])
  if (socioRows.length === 0) throw new AppError('El socio seleccionado no existe.', 404)

  const { rows: planRows } = await pool.query('SELECT * FROM planes WHERE id = $1', [dto.planId])
  if (planRows.length === 0) throw new AppError('El plan seleccionado no existe.', 404)
  const plan = mapPlan(planRows[0])

  const fechaInicio = dto.inicio || today()
  const fechaFin = addDays(fechaInicio, plan.duracionDias)
  const memId = uid('M')
  const pagoId = uid('PG')
  const comprobante = generateComprobante()

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const memRes = await client.query(
      `INSERT INTO membresias (id, socio_id, plan_id, fecha_inicio, fecha_fin, actividad_preferida)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [memId, dto.socioId, dto.planId, fechaInicio, fechaFin, dto.actividadPreferida],
    )
    const pagoRes = await client.query(
      `INSERT INTO pagos (id, socio_id, membresia_id, monto, fecha, metodo, estado, comprobante)
       VALUES ($1, $2, $3, $4, $5, '—', 'pendiente', $6)
       RETURNING *`,
      [pagoId, dto.socioId, memId, plan.precio, fechaInicio, comprobante],
    )
    await client.query('COMMIT')

    const membresia = mapMembresia(memRes.rows[0])
    const pago = mapPago(pagoRes.rows[0])

    await registrarEventoNoSQL({
      tipo: 'MEMBRESIA_CREADA',
      modulo: 'membresias',
      descripcion: `Alta de membresía (${plan.nombre}) para ${socioRows[0].nombre}. Vigencia hasta ${fechaFin}.`,
      entidadId: membresia.id,
      socioId: dto.socioId,
      payload: { membresia, pago },
    })

    return { membresia, pago }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function renovarMembresiaPorId(id) {
  const { rows: memRows } = await pool.query('SELECT * FROM membresias WHERE id = $1', [id])
  if (memRows.length === 0) throw new AppError('La membresía a renovar no existe.', 404)
  const actual = mapMembresia(memRows[0])

  const { rows: planRows } = await pool.query('SELECT * FROM planes WHERE id = $1', [actual.planId])
  if (planRows.length === 0) throw new AppError('El plan asociado no existe.', 404)
  const plan = mapPlan(planRows[0])

  const { rows: socioRows } = await pool.query('SELECT nombre FROM socios WHERE id = $1', [actual.socioId])

  const inicio = today()
  const fechaFin = addDays(inicio, plan.duracionDias)
  const memId = uid('M')
  const pagoId = uid('PG')
  const comprobante = generateComprobante()

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const memRes = await client.query(
      `INSERT INTO membresias (id, socio_id, plan_id, fecha_inicio, fecha_fin, actividad_preferida)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [memId, actual.socioId, actual.planId, inicio, fechaFin, actual.actividadPreferida],
    )
    const pagoRes = await client.query(
      `INSERT INTO pagos (id, socio_id, membresia_id, monto, fecha, metodo, estado, comprobante)
       VALUES ($1, $2, $3, $4, $5, '—', 'pendiente', $6)
       RETURNING *`,
      [pagoId, actual.socioId, memId, plan.precio, inicio, comprobante],
    )
    await client.query('COMMIT')

    const membresia = mapMembresia(memRes.rows[0])
    const pago = mapPago(pagoRes.rows[0])

    await registrarEventoNoSQL({
      tipo: 'MEMBRESIA_RENOVADA',
      modulo: 'membresias',
      descripcion: `Membresía renovada para ${socioRows[0]?.nombre || actual.socioId} (${plan.nombre}) hasta ${fechaFin}.`,
      entidadId: membresia.id,
      socioId: actual.socioId,
      payload: { membresiaAnteriorId: id, nuevaMembresiaId: memId, comprobante },
    })

    return { membresia, pago }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

/* =========================================================
   INSCRIPCIONES A ACTIVIDADES Y CONTROL DE CUPOS (Regla de Negocio)
   ========================================================= */
export async function listarInscripciones() {
  const { rows } = await pool.query('SELECT * FROM inscripciones ORDER BY fecha_inscripcion DESC, created_at DESC')
  return rows.map(mapInscripcion)
}

export async function crearInscripcion(body) {
  const dto = validateInscripcionDTO(body)

  const [socioRes, actRes, memsRes, inscActivasRes] = await Promise.all([
    pool.query('SELECT * FROM socios WHERE id = $1', [dto.socioId]),
    pool.query('SELECT * FROM actividades WHERE id = $1', [dto.actividadId]),
    pool.query('SELECT * FROM membresias WHERE socio_id = $1 ORDER BY fecha_fin DESC LIMIT 1', [dto.socioId]),
    pool.query(
      `SELECT * FROM inscripciones WHERE actividad_id = $1 AND estado = 'confirmada'`,
      [dto.actividadId],
    ),
  ])

  if (socioRes.rows.length === 0) throw new AppError('El socio seleccionado no existe.', 404)
  if (actRes.rows.length === 0) throw new AppError('La actividad seleccionada no existe.', 404)

  const socio = mapSocio(socioRes.rows[0])
  const actividad = mapActividad(actRes.rows[0])
  const memVigente = memsRes.rows[0] ? mapMembresia(memsRes.rows[0]) : null

  // Regla de negocio 1: El socio debe tener membresía vigente (no vencida)
  if (!memVigente || estadoMembresia(memVigente.fechaFin) === 'vencida') {
    throw new AppError(
      `No se puede inscribir a ${socio.nombre}: su membresía está vencida o no registra membresía activa.`,
      422,
    )
  }

  // Regla de negocio 2: Evitar doble inscripción activa en la misma actividad
  const yaInscrito = inscActivasRes.rows.some((i) => i.socio_id === dto.socioId)
  if (yaInscrito) {
    throw new AppError(`${socio.nombre} ya tiene una inscripción confirmada en "${actividad.nombre}".`, 409)
  }

  // Regla de negocio 3: Control estricto de cupo máximo de la actividad
  const ocupados = inscActivasRes.rows.length
  if (ocupados >= actividad.cupo) {
    throw new AppError(
      `Cupo agotado en "${actividad.nombre}" (${ocupados}/${actividad.cupo} plazas ocupadas).`,
      422,
    )
  }

  const id = uid('IN')
  const { rows } = await pool.query(
    `INSERT INTO inscripciones (id, socio_id, actividad_id, fecha_inscripcion, estado, notas)
     VALUES ($1, $2, $3, $4, 'confirmada', $5)
     RETURNING *`,
    [id, dto.socioId, dto.actividadId, today(), dto.notas],
  )
  const nueva = mapInscripcion(rows[0])

  await registrarEventoNoSQL({
    tipo: 'INSCRIPCION_CONFIRMADA',
    modulo: 'inscripciones',
    descripcion: `Inscripción confirmada de ${socio.nombre} en "${actividad.nombre}" (Cupo ${ocupados + 1}/${actividad.cupo}).`,
    entidadId: nueva.id,
    socioId: socio.id,
    payload: { actividadId: actividad.id, actividadNombre: actividad.nombre, cupoOcupado: ocupados + 1, cupoMax: actividad.cupo },
  })

  return nueva
}

export async function actualizarEstadoInscripcion(id, estado) {
  if (!['confirmada', 'en_espera', 'cancelada'].includes(estado)) {
    throw new AppError('Estado de inscripción no válido.', 400)
  }
  const { rows } = await pool.query(
    `UPDATE inscripciones SET estado = $1 WHERE id = $2 RETURNING *`,
    [estado, id],
  )
  if (rows.length === 0) throw new AppError('Inscripción no encontrada.', 404)
  const insc = mapInscripcion(rows[0])

  await registrarEventoNoSQL({
    tipo: estado === 'cancelada' ? 'INSCRIPCION_CANCELADA' : 'INSCRIPCION_CONFIRMADA',
    modulo: 'inscripciones',
    descripcion: `Inscripción ${insc.id} actualizada a estado "${estado}".`,
    entidadId: insc.id,
    socioId: insc.socioId,
    payload: { inscripcionId: insc.id, estado },
  })

  return insc
}

export async function eliminarInscripcion(id) {
  const { rows } = await pool.query('DELETE FROM inscripciones WHERE id = $1 RETURNING *', [id])
  if (rows.length === 0) throw new AppError('Inscripción no encontrada.', 404)
  return { deleted: true, id }
}

/* =========================================================
   PAGOS Y COMPROBANTES (PostgreSQL + Auditoría MongoDB)
   ========================================================= */
export async function listarPagos() {
  const { rows } = await pool.query('SELECT * FROM pagos ORDER BY fecha DESC, created_at DESC')
  return rows.map(mapPago)
}

export async function crearPago(body) {
  const dto = validatePagoDTO(body)
  const { rows: socioRows } = await pool.query('SELECT nombre FROM socios WHERE id = $1', [dto.socioId])
  if (socioRows.length === 0) throw new AppError('El socio indicado no existe.', 404)

  const id = uid('PG')
  const comprobante = generateComprobante()
  const { rows } = await pool.query(
    `INSERT INTO pagos (id, socio_id, membresia_id, monto, fecha, metodo, estado, comprobante)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [id, dto.socioId, dto.membresiaId, dto.monto, today(), dto.metodo, dto.estado, comprobante],
  )
  const nuevo = mapPago(rows[0])

  await registrarEventoNoSQL({
    tipo: 'PAGO_REGISTRADO',
    modulo: 'pagos',
    descripcion: `Pago registrado para ${socioRows[0].nombre} por $${nuevo.monto.toLocaleString('es-CL')} (${nuevo.comprobante}).`,
    entidadId: nuevo.id,
    socioId: nuevo.socioId,
    payload: nuevo,
  })

  return nuevo
}

export async function marcarPagoComoPagado(id, metodoOpcional) {
  const { rows: prev } = await pool.query('SELECT * FROM pagos WHERE id = $1', [id])
  if (prev.length === 0) throw new AppError('Pago no encontrado.', 404)

  const metodoFinal =
    metodoOpcional || (prev[0].metodo === '—' || !prev[0].metodo ? 'Efectivo' : prev[0].metodo)

  const { rows } = await pool.query(
    `UPDATE pagos SET estado = 'pagado', metodo = $1 WHERE id = $2 RETURNING *`,
    [metodoFinal, id],
  )
  const actualizado = mapPago(rows[0])

  const { rows: socioRows } = await pool.query('SELECT nombre FROM socios WHERE id = $1', [actualizado.socioId])

  await registrarEventoNoSQL({
    tipo: 'PAGO_CONFIRMADO',
    modulo: 'pagos',
    descripcion: `Pago confirmado (${actualizado.comprobante}) de ${socioRows[0]?.nombre || actualizado.socioId} vía ${actualizado.metodo}.`,
    entidadId: actualizado.id,
    socioId: actualizado.socioId,
    payload: actualizado,
  })

  return actualizado
}

/* =========================================================
   ASISTENCIA, CHECK-IN QR Y BITÁCORA (MongoDB NoSQL)
   ========================================================= */
export async function listarAsistencias({ fecha, incluirRechazos = false } = {}) {
  const filter = {}
  if (fecha) filter.fecha = fecha
  if (!incluirRechazos) filter.autorizado = true

  const docs = await AccessLog.find(filter).sort({ fecha: -1, hora: -1, createdAt: -1 }).limit(200).lean()
  return docs.map(mapAccessLog)
}

export async function listarBitacora({ modulo, limite = 100 } = {}) {
  const filter = {}
  if (modulo) filter.modulo = modulo
  const docs = await AuditEvent.find(filter).sort({ createdAt: -1 }).limit(Number(limite) || 100).lean()
  return docs.map(mapAuditEvent)
}

export async function registrarCheckin(body) {
  const dto = validateCheckinDTO(body)

  // Buscar socio por ID o por email en PostgreSQL
  const { rows: socioRows } = await pool.query(
    'SELECT * FROM socios WHERE LOWER(id) = LOWER($1) OR LOWER(email) = LOWER($1) LIMIT 1',
    [dto.codigo],
  )

  if (socioRows.length === 0) {
    throw new AppError(`No existe ningún socio con el código o correo "${dto.codigo}".`, 404)
  }
  const socio = mapSocio(socioRows[0])

  // Buscar actividad si se especificó
  let actividad = null
  if (dto.actividadId) {
    const { rows: actRows } = await pool.query('SELECT * FROM actividades WHERE id = $1', [dto.actividadId])
    if (actRows[0]) actividad = mapActividad(actRows[0])
  }

  // Verificar membresía vigente en PostgreSQL
  const { rows: memRows } = await pool.query(
    'SELECT * FROM membresias WHERE socio_id = $1 ORDER BY fecha_fin DESC LIMIT 1',
    [socio.id],
  )
  const mem = memRows[0] ? mapMembresia(memRows[0]) : null
  const estado = mem ? estadoMembresia(mem.fechaFin) : 'vencida'
  const restantes = mem ? diasRestantes(mem.fechaFin) : null

  const fecha = today()
  const hora = nowTime()
  const codigoAsistencia = uid('AS')

  // Si la membresía no existe o está vencida: guardar el rechazo en MongoDB y devolver 422
  if (!mem || estado === 'vencida') {
    const motivo = mem
      ? `Membresía vencida el ${mem.fechaFin}`
      : 'El socio no tiene una membresía registrada'

    const logRechazado = await AccessLog.create({
      codigo: codigoAsistencia,
      socioId: socio.id,
      socioNombre: socio.nombre,
      actividadId: actividad?.id || dto.actividadId || null,
      actividadNombre: actividad?.nombre || 'General',
      fecha,
      hora,
      metodo: dto.metodo,
      autorizado: false,
      motivo: `Acceso denegado: ${motivo}`,
      metadata: {
        estadoMembresia: 'vencida',
        diasRestantes: restantes,
        dispositivo: dto.metodo === 'QR' ? 'Lector QR Recepción' : 'Terminal Staff Recepción',
        ubicacion: actividad?.ubicacion || 'Acceso Principal',
      },
    })

    await registrarEventoNoSQL({
      tipo: 'CHECKIN_DENEGADO',
      modulo: 'asistencia',
      descripcion: `Acceso denegado a ${socio.nombre} (${dto.metodo}): ${motivo}.`,
      entidadId: codigoAsistencia,
      socioId: socio.id,
      payload: mapAccessLog(logRechazado),
    })

    throw new AppError(`Acceso denegado para ${socio.nombre}: ${motivo}.`, 422, {
      accessLog: mapAccessLog(logRechazado),
      socio,
    })
  }

  // Si la membresía está vigente: registrar acceso autorizado en MongoDB
  const motivoOk =
    estado === 'por_vencer'
      ? `Ingreso autorizado (Membresía vence en ${restantes} día(s))`
      : 'Ingreso autorizado (Membresía activa)'

  const logAutorizado = await AccessLog.create({
    codigo: codigoAsistencia,
    socioId: socio.id,
    socioNombre: socio.nombre,
    actividadId: actividad?.id || dto.actividadId || null,
    actividadNombre: actividad?.nombre || 'General',
    fecha,
    hora,
    metodo: dto.metodo,
    autorizado: true,
    motivo: motivoOk,
    metadata: {
      estadoMembresia: estado,
      diasRestantes: restantes,
      dispositivo: dto.metodo === 'QR' ? 'Lector QR Recepción' : 'Terminal Staff Recepción',
      ubicacion: actividad?.ubicacion || 'Acceso Principal',
    },
  })

  await registrarEventoNoSQL({
    tipo: 'CHECKIN_AUTORIZADO',
    modulo: 'asistencia',
    descripcion: `Check-in ${dto.metodo} registrado para ${socio.nombre} en ${actividad?.nombre || 'General'}.`,
    entidadId: codigoAsistencia,
    socioId: socio.id,
    payload: mapAccessLog(logAutorizado),
  })

  return {
    asistencia: mapAccessLog(logAutorizado),
    socio,
    estadoMembresia: estado,
    diasRestantes: restantes,
  }
}

/* =========================================================
   REINICIAR DATOS DE EJEMPLO (PostgreSQL + MongoDB)
   ========================================================= */
export async function reiniciarDatosDeEjemplo() {
  await seedDatabases({ force: true })
  return obtenerEstadoCompleto()
}
