// Servicio de datos de ClubTrack.
// Sin backend: la "base de datos" es un objeto en memoria que se persiste en localStorage.
// Los datos iniciales provienen de data/iniciales.json y se "siembran" la primera vez.

import iniciales from '../data/iniciales.json'
import { addDays, today } from '../utils/dates'
import { uid } from '../utils/id'
import { readJSON, writeJSON, removeKey, KEYS } from './storage'

function buildSeed() {
  const t = today()

  const socios = iniciales.socios.map((s) => ({
    id: s.id,
    nombre: s.nombre,
    email: s.email,
    telefono: s.telefono,
    fechaIngreso: addDays(t, s.fechaIngresoOffset),
  }))

  const planes = iniciales.planes.map((p) => ({ ...p }))
  const actividades = iniciales.actividades.map((a) => ({ ...a }))

  const membresias = []
  const pagos = []
  let payCounter = 1

  iniciales.membresiasSeed.forEach((m, idx) => {
    const plan = planes.find((p) => p.id === m.planId)
    if (!plan) return
    const fechaInicio = addDays(t, m.inicioOffset)
    const fechaFin = addDays(fechaInicio, plan.duracionDias)
    const memId = 'M' + String(idx + 1).padStart(3, '0')

    membresias.push({
      id: memId,
      socioId: m.socioId,
      planId: m.planId,
      fechaInicio,
      fechaFin,
      actividadPreferida: m.actividadPreferida,
    })

    pagos.push({
      id: 'PG' + String(payCounter++).padStart(3, '0'),
      socioId: m.socioId,
      membresiaId: memId,
      monto: plan.precio,
      fecha: fechaInicio,
      metodo: m.metodo,
      estado: m.pagoEstado,
    })
  })

  // Asistencias simuladas de los últimos 7 días (patrón reproducible)
  const asistencias = []
  let asisCounter = 1
  const activos = membresias.filter((m) => new Date(m.fechaFin) >= new Date(t + 'T00:00:00'))
  for (let offset = 6; offset >= 0; offset--) {
    const fecha = addDays(t, -offset)
    activos.forEach((m, i) => {
      if ((i + offset) % 3 !== 0) return
      const hora = ['07:15', '08:40', '12:05', '18:30', '19:50'][(i + offset) % 5]
      asistencias.push({
        id: 'AS' + String(asisCounter++).padStart(4, '0'),
        socioId: m.socioId,
        actividadId: m.actividadPreferida,
        fecha,
        hora,
        metodo: i % 2 === 0 ? 'QR' : 'Manual',
      })
    })
  }

  return { socios, planes, actividades, membresias, pagos, asistencias }
}

export function loadDB() {
  const db = readJSON(KEYS.db, null)
  if (db && db.socios) return db
  const seed = buildSeed()
  writeJSON(KEYS.db, seed)
  writeJSON(KEYS.seeded, true)
  return seed
}

export function saveDB(db) {
  writeJSON(KEYS.db, db)
}

export function resetDB() {
  removeKey(KEYS.db)
  removeKey(KEYS.seeded)
  return loadDB()
}

export { uid }
