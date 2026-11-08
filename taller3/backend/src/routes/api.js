import { Router } from 'express'
import * as ctrl from '../controllers/clubController.js'

const router = Router()

// Salud y estado general (SQL + NoSQL)
router.get('/health', ctrl.getHealth)
router.get('/bootstrap', ctrl.getBootstrap)
router.post('/reset', ctrl.postReset)

// Socios (SQL + Auditoría NoSQL)
router.get('/socios', ctrl.getSocios)
router.get('/socios/:id', ctrl.getSocioById)
router.post('/socios', ctrl.postSocio)
router.put('/socios/:id', ctrl.putSocio)
router.delete('/socios/:id', ctrl.deleteSocio)

// Instructores / Organizadores (SQL)
router.get('/instructores', ctrl.getInstructores)
router.post('/instructores', ctrl.postInstructor)
router.put('/instructores/:id', ctrl.putInstructor)
router.delete('/instructores/:id', ctrl.deleteInstructor)

// Planes (SQL)
router.get('/planes', ctrl.getPlanes)
router.post('/planes', ctrl.postPlan)
router.put('/planes/:id', ctrl.putPlan)
router.delete('/planes/:id', ctrl.deletePlan)

// Actividades / Eventos (SQL)
router.get('/actividades', ctrl.getActividades)
router.post('/actividades', ctrl.postActividad)
router.put('/actividades/:id', ctrl.putActividad)
router.delete('/actividades/:id', ctrl.deleteActividad)

// Membresías (SQL Transaccional + NoSQL)
router.get('/membresias', ctrl.getMembresias)
router.post('/membresias', ctrl.postMembresia)
router.post('/membresias/:id/renovar', ctrl.postRenovarMembresia)

// Inscripciones y Control de Cupos (SQL + Reglas de Negocio)
router.get('/inscripciones', ctrl.getInscripciones)
router.post('/inscripciones', ctrl.postInscripcion)
router.patch('/inscripciones/:id/estado', ctrl.patchInscripcionEstado)
router.delete('/inscripciones/:id', ctrl.deleteInscripcion)

// Pagos y Comprobantes (SQL + NoSQL)
router.get('/pagos', ctrl.getPagos)
router.post('/pagos', ctrl.postPago)
router.patch('/pagos/:id/pagar', ctrl.patchMarcarPagado)

// Asistencias, Check-in QR y Bitácora Operacional (MongoDB NoSQL)
router.get('/asistencias', ctrl.getAsistencias)
router.post('/asistencias/checkin', ctrl.postCheckin)
router.get('/bitacora', ctrl.getBitacora)

export default router
