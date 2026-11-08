import * as clubService from '../services/clubService.js'
import { testPostgresConnection } from '../config/postgres.js'
import { isMongoConnected } from '../config/mongo.js'

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ---------- Salud y Estado General ---------- */
export const getHealth = asyncHandler(async (req, res) => {
  const pgOk = await testPostgresConnection().catch(() => false)
  const mongoOk = isMongoConnected()
  res.json({
    ok: pgOk && mongoOk,
    service: 'ClubTrack API REST (Hito 3)',
    databases: {
      postgresql: pgOk ? 'connected' : 'disconnected',
      mongodb: mongoOk ? 'connected' : 'disconnected',
    },
    timestamp: new Date().toISOString(),
  })
})

export const getBootstrap = asyncHandler(async (req, res) => {
  const data = await clubService.obtenerEstadoCompleto()
  res.json({ ok: true, data })
})

export const postReset = asyncHandler(async (req, res) => {
  const data = await clubService.reiniciarDatosDeEjemplo()
  res.json({ ok: true, message: 'Datos de ejemplo restaurados en PostgreSQL y MongoDB.', data })
})

/* ---------- Socios ---------- */
export const getSocios = asyncHandler(async (req, res) => {
  const data = await clubService.listarSocios()
  res.json({ ok: true, data })
})

export const getSocioById = asyncHandler(async (req, res) => {
  const data = await clubService.obtenerSocioDetalle(req.params.id)
  res.json({ ok: true, data })
})

export const postSocio = asyncHandler(async (req, res) => {
  const data = await clubService.crearSocio(req.body)
  res.status(201).json({ ok: true, data })
})

export const putSocio = asyncHandler(async (req, res) => {
  const data = await clubService.actualizarSocio(req.params.id, req.body)
  res.json({ ok: true, data })
})

export const deleteSocio = asyncHandler(async (req, res) => {
  const data = await clubService.eliminarSocio(req.params.id)
  res.json({ ok: true, data })
})

/* ---------- Instructores / Organizadores ---------- */
export const getInstructores = asyncHandler(async (req, res) => {
  const data = await clubService.listarInstructores()
  res.json({ ok: true, data })
})

export const postInstructor = asyncHandler(async (req, res) => {
  const data = await clubService.crearInstructor(req.body)
  res.status(201).json({ ok: true, data })
})

export const putInstructor = asyncHandler(async (req, res) => {
  const data = await clubService.actualizarInstructor(req.params.id, req.body)
  res.json({ ok: true, data })
})

export const deleteInstructor = asyncHandler(async (req, res) => {
  const data = await clubService.eliminarInstructor(req.params.id)
  res.json({ ok: true, data })
})

/* ---------- Planes ---------- */
export const getPlanes = asyncHandler(async (req, res) => {
  const data = await clubService.listarPlanes()
  res.json({ ok: true, data })
})

export const postPlan = asyncHandler(async (req, res) => {
  const data = await clubService.crearPlan(req.body)
  res.status(201).json({ ok: true, data })
})

export const putPlan = asyncHandler(async (req, res) => {
  const data = await clubService.actualizarPlan(req.params.id, req.body)
  res.json({ ok: true, data })
})

export const deletePlan = asyncHandler(async (req, res) => {
  const data = await clubService.eliminarPlan(req.params.id)
  res.json({ ok: true, data })
})

/* ---------- Actividades / Eventos ---------- */
export const getActividades = asyncHandler(async (req, res) => {
  const data = await clubService.listarActividades()
  res.json({ ok: true, data })
})

export const postActividad = asyncHandler(async (req, res) => {
  const data = await clubService.crearActividad(req.body)
  res.status(201).json({ ok: true, data })
})

export const putActividad = asyncHandler(async (req, res) => {
  const data = await clubService.actualizarActividad(req.params.id, req.body)
  res.json({ ok: true, data })
})

export const deleteActividad = asyncHandler(async (req, res) => {
  const data = await clubService.eliminarActividad(req.params.id)
  res.json({ ok: true, data })
})

/* ---------- Membresías ---------- */
export const getMembresias = asyncHandler(async (req, res) => {
  const data = await clubService.listarMembresias()
  res.json({ ok: true, data })
})

export const postMembresia = asyncHandler(async (req, res) => {
  const data = await clubService.crearMembresia(req.body)
  res.status(201).json({ ok: true, data })
})

export const postRenovarMembresia = asyncHandler(async (req, res) => {
  const data = await clubService.renovarMembresiaPorId(req.params.id)
  res.status(201).json({ ok: true, data })
})

/* ---------- Inscripciones y Control de Cupos ---------- */
export const getInscripciones = asyncHandler(async (req, res) => {
  const data = await clubService.listarInscripciones()
  res.json({ ok: true, data })
})

export const postInscripcion = asyncHandler(async (req, res) => {
  const data = await clubService.crearInscripcion(req.body)
  res.status(201).json({ ok: true, data })
})

export const patchInscripcionEstado = asyncHandler(async (req, res) => {
  const data = await clubService.actualizarEstadoInscripcion(req.params.id, req.body?.estado)
  res.json({ ok: true, data })
})

export const deleteInscripcion = asyncHandler(async (req, res) => {
  const data = await clubService.eliminarInscripcion(req.params.id)
  res.json({ ok: true, data })
})

/* ---------- Pagos y Comprobantes ---------- */
export const getPagos = asyncHandler(async (req, res) => {
  const data = await clubService.listarPagos()
  res.json({ ok: true, data })
})

export const postPago = asyncHandler(async (req, res) => {
  const data = await clubService.crearPago(req.body)
  res.status(201).json({ ok: true, data })
})

export const patchMarcarPagado = asyncHandler(async (req, res) => {
  const data = await clubService.marcarPagoComoPagado(req.params.id, req.body?.metodo)
  res.json({ ok: true, data })
})

/* ---------- Asistencia, Check-in QR y Bitácora (MongoDB) ---------- */
export const getAsistencias = asyncHandler(async (req, res) => {
  const { fecha, incluirRechazos } = req.query
  const data = await clubService.listarAsistencias({
    fecha,
    incluirRechazos: incluirRechazos === 'true',
  })
  res.json({ ok: true, data })
})

export const postCheckin = asyncHandler(async (req, res) => {
  const data = await clubService.registrarCheckin(req.body)
  res.status(201).json({ ok: true, data })
})

export const getBitacora = asyncHandler(async (req, res) => {
  const { modulo, limite } = req.query
  const data = await clubService.listarBitacora({ modulo, limite })
  res.json({ ok: true, data })
})
