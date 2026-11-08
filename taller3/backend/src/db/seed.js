import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { pool } from '../config/postgres.js'
import { AccessLog } from '../models/AccessLog.js'
import { AuditEvent } from '../models/AuditEvent.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export function today() {
  return new Date().toISOString().slice(0, 10)
}

export function nowTime() {
  return new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export const SEED_DATA = {
  instructores: [
    {
      id: 'I01',
      nombre: 'Rodrigo Paredes',
      especialidad: 'Entrenamiento Funcional & HIIT',
      email: 'rodrigo.paredes@clubtrack.cl',
      telefono: '+56 9 7700 1101',
      bio: 'Profesor de Educación Física, especialista en preparación física de alto rendimiento.',
      activo: true,
    },
    {
      id: 'I02',
      nombre: 'Camila Ortiz',
      especialidad: 'Indoor Cycling & Cardio',
      email: 'camila.ortiz@clubtrack.cl',
      telefono: '+56 9 7700 1102',
      bio: 'Instructora certificada en Spinning y resistencia cardiovascular.',
      activo: true,
    },
    {
      id: 'I03',
      nombre: 'Paula Andrade',
      especialidad: 'Yoga Vinyasa & Movilidad',
      email: 'paula.andrade@clubtrack.cl',
      telefono: '+56 9 7700 1103',
      bio: 'Instructora de Hatha y Vinyasa Yoga con 8 años de experiencia en bienestar corporal.',
      activo: true,
    },
    {
      id: 'I04',
      nombre: 'Javier Morales',
      especialidad: 'Musculación & Halterofilia',
      email: 'javier.morales@clubtrack.cl',
      telefono: '+56 9 7700 1104',
      bio: 'Entrenador de sala de pesas, biomecánica y fuerza aplicada.',
      activo: true,
    },
  ],
  socios: [
    { id: 'S001', nombre: 'Camila Reyes', email: 'camila.reyes@mail.com', telefono: '+56 9 8123 4501', offset: -220 },
    { id: 'S002', nombre: 'Matías Fuentes', email: 'matias.fuentes@mail.com', telefono: '+56 9 8123 4502', offset: -190 },
    { id: 'S003', nombre: 'Valentina Soto', email: 'valentina.soto@mail.com', telefono: '+56 9 8123 4503', offset: -160 },
    { id: 'S004', nombre: 'Benjamín Rojas', email: 'benjamin.rojas@mail.com', telefono: '+56 9 8123 4504', offset: -140 },
    { id: 'S005', nombre: 'Francisca Muñoz', email: 'francisca.munoz@mail.com', telefono: '+56 9 8123 4505', offset: -95 },
    { id: 'S006', nombre: 'Diego Castillo', email: 'diego.castillo@mail.com', telefono: '+56 9 8123 4506', offset: -70 },
    { id: 'S007', nombre: 'Antonia Vargas', email: 'antonia.vargas@mail.com', telefono: '+56 9 8123 4507', offset: -45 },
    { id: 'S008', nombre: 'Ignacio Herrera', email: 'ignacio.herrera@mail.com', telefono: '+56 9 8123 4508', offset: -20 },
    { id: 'S009', nombre: 'Josefa Contreras', email: 'josefa.contreras@mail.com', telefono: '+56 9 8123 4509', offset: -10 },
  ],
  planes: [
    {
      id: 'P01',
      nombre: 'Plan Básico',
      descripcion: 'Acceso a sala de musculación en horario diurno.',
      precio: 24990,
      duracionDias: 30,
      actividades: ['Musculación'],
    },
    {
      id: 'P02',
      nombre: 'Plan Full',
      descripcion: 'Acceso ilimitado a todas las actividades del club.',
      precio: 39990,
      duracionDias: 30,
      actividades: ['Musculación', 'Funcional', 'Spinning', 'Yoga'],
    },
    {
      id: 'P03',
      nombre: 'Plan Trimestral',
      descripcion: 'Plan Full con permanencia trimestral y descuento.',
      precio: 99990,
      duracionDias: 90,
      actividades: ['Musculación', 'Funcional', 'Spinning', 'Yoga'],
    },
    {
      id: 'P04',
      nombre: 'Plan Estudiante',
      descripcion: 'Tarifa preferencial acreditando matrícula vigente.',
      precio: 17990,
      duracionDias: 30,
      actividades: ['Musculación', 'Funcional'],
    },
  ],
  actividades: [
    {
      id: 'A01',
      nombre: 'Musculación libre',
      categoria: 'Fuerza',
      instructorId: 'I04',
      instructor: 'Javier Morales',
      horario: 'Lun a Sáb · 07:00–22:00',
      ubicacion: 'Sala de Pesas Piso 1',
      cupo: 40,
      exterior: false,
      publicada: true,
    },
    {
      id: 'A02',
      nombre: 'Funcional HIIT',
      categoria: 'Acondicionamiento',
      instructorId: 'I01',
      instructor: 'Rodrigo Paredes',
      horario: 'Lun / Mié / Vie · 19:00',
      ubicacion: 'Cancha Exterior Norte',
      cupo: 18,
      exterior: true,
      publicada: true,
    },
    {
      id: 'A03',
      nombre: 'Spinning',
      categoria: 'Cardio',
      instructorId: 'I02',
      instructor: 'Camila Ortiz',
      horario: 'Mar / Jue · 08:00',
      ubicacion: 'Sala Indoor Piso 2',
      cupo: 20,
      exterior: false,
      publicada: true,
    },
    {
      id: 'A04',
      nombre: 'Yoga',
      categoria: 'Mente y Cuerpo',
      instructorId: 'I03',
      instructor: 'Paula Andrade',
      horario: 'Mar / Jue / Sáb · 09:30',
      ubicacion: 'Terraza Jardín Sur',
      cupo: 15,
      exterior: true,
      publicada: true,
    },
  ],
  membresiasSeed: [
    { socioId: 'S001', planId: 'P02', inicioOffset: -30, actividadPreferida: 'A02', pagoEstado: 'pagado', metodo: 'Transferencia' },
    { socioId: 'S002', planId: 'P03', inicioOffset: -60, actividadPreferida: 'A03', pagoEstado: 'pagado', metodo: 'Débito' },
    { socioId: 'S003', planId: 'P01', inicioOffset: -33, actividadPreferida: 'A01', pagoEstado: 'pendiente', metodo: '—' },
    { socioId: 'S004', planId: 'P02', inicioOffset: -27, actividadPreferida: 'A04', pagoEstado: 'pagado', metodo: 'Transferencia' },
    { socioId: 'S005', planId: 'P04', inicioOffset: -14, actividadPreferida: 'A02', pagoEstado: 'pagado', metodo: 'Débito' },
    { socioId: 'S006', planId: 'P01', inicioOffset: -45, actividadPreferida: 'A01', pagoEstado: 'pendiente', metodo: '—' },
    { socioId: 'S007', planId: 'P02', inicioOffset: -5, actividadPreferida: 'A03', pagoEstado: 'pagado', metodo: 'Transferencia' },
    { socioId: 'S008', planId: 'P04', inicioOffset: -3, actividadPreferida: 'A01', pagoEstado: 'pagado', metodo: 'Efectivo' },
    { socioId: 'S009', planId: 'P02', inicioOffset: -1, actividadPreferida: 'A04', pagoEstado: 'pagado', metodo: 'Transferencia' },
  ],
}

export async function ensureSchema() {
  const schemaPath = path.join(__dirname, 'schema.sql')
  const sql = fs.readFileSync(schemaPath, 'utf-8')
  await pool.query(sql)
}

export async function seedDatabases({ force = false } = {}) {
  await ensureSchema()

  const { rows: existingSocios } = await pool.query('SELECT COUNT(*)::int AS count FROM socios')
  if (!force && existingSocios[0].count > 0) {
    console.log('[Seed] PostgreSQL ya contiene datos. Omitiendo seed automático.')
    return { seeded: false }
  }

  console.log('[Seed] Inicializando datos semilla en PostgreSQL y MongoDB...')
  const t = today()

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Limpiar tablas en orden de dependencias
    await client.query('DELETE FROM pagos')
    await client.query('DELETE FROM inscripciones')
    await client.query('DELETE FROM membresias')
    await client.query('DELETE FROM actividades')
    await client.query('DELETE FROM planes')
    await client.query('DELETE FROM socios')
    await client.query('DELETE FROM instructores')

    for (const inst of SEED_DATA.instructores) {
      await client.query(
        `INSERT INTO instructores (id, nombre, especialidad, email, telefono, bio, activo)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [inst.id, inst.nombre, inst.especialidad, inst.email, inst.telefono, inst.bio, inst.activo],
      )
    }

    for (const s of SEED_DATA.socios) {
      const fechaIngreso = addDays(t, s.offset)
      await client.query(
        `INSERT INTO socios (id, nombre, email, telefono, fecha_ingreso)
         VALUES ($1, $2, $3, $4, $5)`,
        [s.id, s.nombre, s.email, s.telefono, fechaIngreso],
      )
    }

    for (const p of SEED_DATA.planes) {
      await client.query(
        `INSERT INTO planes (id, nombre, descripcion, precio, duracion_dias, actividades)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
        [p.id, p.nombre, p.descripcion, p.precio, p.duracionDias, JSON.stringify(p.actividades)],
      )
    }

    for (const a of SEED_DATA.actividades) {
      await client.query(
        `INSERT INTO actividades (id, nombre, categoria, instructor_id, instructor, horario, ubicacion, cupo, exterior, publicada)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          a.id,
          a.nombre,
          a.categoria,
          a.instructorId,
          a.instructor,
          a.horario,
          a.ubicacion,
          a.cupo,
          a.exterior,
          a.publicada,
        ],
      )
    }

    const membresiasCreadas = []
    let payCounter = 1
    let insCounter = 1

    for (let idx = 0; idx < SEED_DATA.membresiasSeed.length; idx++) {
      const m = SEED_DATA.membresiasSeed[idx]
      const plan = SEED_DATA.planes.find((p) => p.id === m.planId)
      const fechaInicio = addDays(t, m.inicioOffset)
      const fechaFin = addDays(fechaInicio, plan.duracionDias)
      const memId = 'M' + String(idx + 1).padStart(3, '0')

      await client.query(
        `INSERT INTO membresias (id, socio_id, plan_id, fecha_inicio, fecha_fin, actividad_preferida)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [memId, m.socioId, m.planId, fechaInicio, fechaFin, m.actividadPreferida],
      )

      const pagoId = 'PG' + String(payCounter++).padStart(3, '0')
      const comprobante = `BOL-2026-${String(payCounter - 1).padStart(4, '0')}`
      await client.query(
        `INSERT INTO pagos (id, socio_id, membresia_id, monto, fecha, metodo, estado, comprobante)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [pagoId, m.socioId, memId, plan.precio, fechaInicio, m.metodo, m.pagoEstado, comprobante],
      )

      membresiasCreadas.push({
        id: memId,
        socioId: m.socioId,
        planId: m.planId,
        fechaInicio,
        fechaFin,
        actividadPreferida: m.actividadPreferida,
      })

      // Si la membresía no está vencida, crear inscripción confirmada en su actividad preferida
      if (new Date(fechaFin) >= new Date(t + 'T00:00:00') && m.actividadPreferida) {
        const insId = 'IN' + String(insCounter++).padStart(3, '0')
        await client.query(
          `INSERT INTO inscripciones (id, socio_id, actividad_id, fecha_inscripcion, estado, notas)
           VALUES ($1, $2, $3, $4, 'confirmada', 'Inscripción inicial por plan vigente')`,
          [insId, m.socioId, m.actividadPreferida, fechaInicio],
        )
      }
    }

    await client.query('COMMIT')

    // Poblar MongoDB (AccessLog y AuditEvent)
    await AccessLog.deleteMany({})
    await AuditEvent.deleteMany({})

    const activos = membresiasCreadas.filter((m) => new Date(m.fechaFin) >= new Date(t + 'T00:00:00'))
    let asisCounter = 1
    const accessDocs = []

    for (let offset = 6; offset >= 0; offset--) {
      const fecha = addDays(t, -offset)
      activos.forEach((m, i) => {
        if ((i + offset) % 3 !== 0) return
        const hora = ['07:15', '08:40', '12:05', '18:30', '19:50'][(i + offset) % 5]
        const socio = SEED_DATA.socios.find((s) => s.id === m.socioId)
        const act = SEED_DATA.actividades.find((a) => a.id === m.actividadPreferida)
        accessDocs.push({
          codigo: 'AS' + String(asisCounter++).padStart(4, '0'),
          socioId: m.socioId,
          socioNombre: socio?.nombre || m.socioId,
          actividadId: m.actividadPreferida,
          actividadNombre: act?.nombre || 'General',
          fecha,
          hora,
          metodo: i % 2 === 0 ? 'QR' : 'Manual',
          autorizado: true,
          motivo: 'Membresía vigente verificada',
          metadata: {
            estadoMembresia: 'activa',
            diasRestantes: 15,
            dispositivo: i % 2 === 0 ? 'Lector QR Recepción' : 'Terminal Staff Recepción',
            ubicacion: act?.ubicacion || 'Acceso Principal',
          },
        })
      })
    }

    // Agregar 2 intentos denegados en MongoDB para mostrar trazabilidad real de rechazos
    accessDocs.push(
      {
        codigo: 'AS' + String(asisCounter++).padStart(4, '0'),
        socioId: 'S003',
        socioNombre: 'Valentina Soto',
        actividadId: 'A01',
        actividadNombre: 'Musculación libre',
        fecha: t,
        hora: '09:12',
        metodo: 'QR',
        autorizado: false,
        motivo: 'Acceso denegado: Membresía vencida',
        metadata: {
          estadoMembresia: 'vencida',
          diasRestantes: -3,
          dispositivo: 'Lector QR Recepción',
          ubicacion: 'Torniquete Entrada',
        },
      },
      {
        codigo: 'AS' + String(asisCounter++).padStart(4, '0'),
        socioId: 'S006',
        socioNombre: 'Diego Castillo',
        actividadId: 'A01',
        actividadNombre: 'Musculación libre',
        fecha: addDays(t, -1),
        hora: '18:05',
        metodo: 'Manual',
        autorizado: false,
        motivo: 'Acceso denegado: Membresía vencida y pago pendiente',
        metadata: {
          estadoMembresia: 'vencida',
          diasRestantes: -15,
          dispositivo: 'Terminal Staff Recepción',
          ubicacion: 'Acceso Principal',
        },
      },
    )

    await AccessLog.insertMany(accessDocs)

    await AuditEvent.insertMany([
      {
        tipo: 'SISTEMA_SEED',
        modulo: 'sistema',
        descripcion: 'Inicialización de datos de demostración en PostgreSQL y MongoDB.',
        actor: 'Sistema',
        entidadId: 'SEED-INIT',
        payload: { socios: SEED_DATA.socios.length, planes: SEED_DATA.planes.length, logs: accessDocs.length },
        fecha: t,
        hora: '08:00',
      },
      {
        tipo: 'PAGO_CONFIRMADO',
        modulo: 'pagos',
        descripcion: 'Pago confirmado para Josefa Contreras (Plan Full — $39.990).',
        actor: 'Recepción',
        entidadId: 'PG009',
        socioId: 'S009',
        payload: { monto: 39990, metodo: 'Transferencia', comprobante: 'BOL-2026-0009' },
        fecha: addDays(t, -1),
        hora: '11:20',
      },
      {
        tipo: 'CHECKIN_DENEGADO',
        modulo: 'asistencia',
        descripcion: 'Intento de acceso QR rechazado para Valentina Soto por membresía vencida.',
        actor: 'Lector QR',
        entidadId: 'S003',
        socioId: 'S003',
        payload: { actividadId: 'A01', metodo: 'QR', motivo: 'Membresía vencida' },
        fecha: t,
        hora: '09:12',
      },
    ])

    console.log('[Seed] Datos inicializados con éxito en PostgreSQL y MongoDB.')
    return { seeded: true }
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('[Seed] Error durante el seed:', err)
    throw err
  } finally {
    client.release()
  }
}
