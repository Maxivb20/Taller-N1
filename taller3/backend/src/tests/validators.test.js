import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  AppError,
  validateSocioDTO,
  validatePlanDTO,
  validateInstructorDTO,
  validateActividadDTO,
  validateInscripcionDTO,
  validatePagoDTO,
  validateCheckinDTO,
} from '../schemas/validators.js'
import { diasRestantes, estadoMembresia } from '../services/clubService.js'
import { addDays, today } from '../db/seed.js'

describe('Validaciones de datos y reglas de negocio (ClubTrack)', () => {
  it('acepta un socio con datos válidos y normaliza el correo', () => {
    const res = validateSocioDTO({
      nombre: '  Camila Reyes ',
      email: 'Camila.Reyes@Mail.com ',
      telefono: '+56 9 8123 4501',
    })
    assert.equal(res.nombre, 'Camila Reyes')
    assert.equal(res.email, 'camila.reyes@mail.com')
  })

  it('rechaza un socio con nombre corto o correo inválido (HTTP 400)', () => {
    assert.throws(
      () => validateSocioDTO({ nombre: 'Jo', email: 'test@mail.com', telefono: '12345678' }),
      (err) => err instanceof AppError && err.statusCode === 400,
    )
    assert.throws(
      () => validateSocioDTO({ nombre: 'Jorge', email: 'correo-invalido', telefono: '12345678' }),
      (err) => err instanceof AppError && err.statusCode === 400,
    )
  })

  it('valida que el precio y la duración de un plan sean mayores a 0', () => {
    const plan = validatePlanDTO({
      nombre: 'Plan Full',
      precio: 39990,
      duracionDias: 30,
      actividades: 'Musculación, Yoga',
    })
    assert.equal(plan.precio, 39990)
    assert.deepEqual(plan.actividades, ['Musculación', 'Yoga'])

    assert.throws(
      () => validatePlanDTO({ nombre: 'Plan Gratis', precio: 0, duracionDias: 30 }),
      (err) => err instanceof AppError && err.statusCode === 400,
    )
  })

  it('valida el cupo máximo de una actividad (> 0)', () => {
    const act = validateActividadDTO({
      nombre: 'Spinning',
      horario: 'Mar / Jue 08:00',
      cupo: 20,
    })
    assert.equal(act.cupo, 20)

    assert.throws(
      () => validateActividadDTO({ nombre: 'Spinning', horario: '08:00', cupo: -5 }),
      (err) => err instanceof AppError && err.statusCode === 400,
    )
  })

  it('valida los datos de instructor, inscripción, pago y check-in', () => {
    const inst = validateInstructorDTO({
      nombre: 'Rodrigo Paredes',
      especialidad: 'HIIT',
      email: 'rodrigo@clubtrack.cl',
      telefono: '+56 9 7700 1101',
    })
    assert.equal(inst.activo, true)

    const insc = validateInscripcionDTO({ socioId: 'S001', actividadId: 'A02' })
    assert.equal(insc.socioId, 'S001')

    const pago = validatePagoDTO({ socioId: 'S001', monto: 24990, metodo: 'Débito' })
    assert.equal(pago.estado, 'pagado')

    const checkin = validateCheckinDTO({ codigo: 'S001', metodo: 'QR' })
    assert.equal(checkin.metodo, 'QR')
  })

  it('calcula correctamente el estado de vigencia de una membresía (activa, por_vencer, vencida)', () => {
    const hoy = today()
    const fechaActiva = addDays(hoy, 20)
    const fechaPorVencer = addDays(hoy, 4)
    const fechaVencida = addDays(hoy, -2)

    assert.equal(estadoMembresia(fechaActiva), 'activa')
    assert.equal(estadoMembresia(fechaPorVencer), 'por_vencer')
    assert.equal(estadoMembresia(fechaVencida), 'vencida')
    assert.equal(diasRestantes(fechaPorVencer), 4)
  })
})
