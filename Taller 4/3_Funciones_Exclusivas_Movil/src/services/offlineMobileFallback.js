// Base de datos embebida de respaldo para cuando la APK móvil corre sin conexión al servidor Express.
// Replica exactamente las mismas reglas de negocio de PostgreSQL y MongoDB del backend (Hito 3).

const STORAGE_KEY = 'clubtrack_mobile_offline_db_v4'
const API_URL_STORAGE_KEY = 'clubtrack_mobile_api_url'

export function getConfiguredApiUrl() {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = window.localStorage.getItem(API_URL_STORAGE_KEY)
    if (saved && saved.trim()) return saved.trim()
  }
  return import.meta.env.VITE_API_URL || 'http://10.0.2.2:4000/api'
}

export function setConfiguredApiUrl(url) {
  if (typeof window !== 'undefined' && window.localStorage) {
    if (!url || !url.trim()) {
      window.localStorage.removeItem(API_URL_STORAGE_KEY)
    } else {
      window.localStorage.setItem(API_URL_STORAGE_KEY, url.trim().replace(/\/+$/, ''))
    }
  }
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function nowTime() {
  return new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function uid(prefix) {
  return `${prefix}${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`
}

function generateComprobante() {
  const rnd = Math.floor(1000 + Math.random() * 9000)
  return `BOL-${new Date().getFullYear()}-${rnd}-${Date.now().toString().slice(-3)}`
}

function diasRestantes(fechaFin) {
  const a = new Date(today() + 'T00:00:00')
  const b = new Date(fechaFin + 'T00:00:00')
  return Math.round((b - a) / 86400000)
}

function estadoMembresia(fechaFin) {
  const r = diasRestantes(fechaFin)
  if (r < 0) return 'vencida'
  if (r <= 7) return 'por_vencer'
  return 'activa'
}

function buildInitialMobileSeed() {
  const t = today()

  const instructores = [
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
  ]

  const socios = [
    { id: 'S001', nombre: 'Camila Reyes', email: 'camila.reyes@mail.com', telefono: '+56 9 8123 4501', fechaIngreso: addDays(t, -220) },
    { id: 'S002', nombre: 'Matías Fuentes', email: 'matias.fuentes@mail.com', telefono: '+56 9 8123 4502', fechaIngreso: addDays(t, -190) },
    { id: 'S003', nombre: 'Valentina Soto', email: 'valentina.soto@mail.com', telefono: '+56 9 8123 4503', fechaIngreso: addDays(t, -160) },
    { id: 'S004', nombre: 'Benjamín Rojas', email: 'benjamin.rojas@mail.com', telefono: '+56 9 8123 4504', fechaIngreso: addDays(t, -140) },
    { id: 'S005', nombre: 'Francisca Muñoz', email: 'francisca.munoz@mail.com', telefono: '+56 9 8123 4505', fechaIngreso: addDays(t, -95) },
    { id: 'S006', nombre: 'Diego Castillo', email: 'diego.castillo@mail.com', telefono: '+56 9 8123 4506', fechaIngreso: addDays(t, -70) },
    { id: 'S007', nombre: 'Antonia Vargas', email: 'antonia.vargas@mail.com', telefono: '+56 9 8123 4507', fechaIngreso: addDays(t, -45) },
    { id: 'S008', nombre: 'Ignacio Herrera', email: 'ignacio.herrera@mail.com', telefono: '+56 9 8123 4508', fechaIngreso: addDays(t, -20) },
    { id: 'S009', nombre: 'Josefa Contreras', email: 'josefa.contreras@mail.com', telefono: '+56 9 8123 4509', fechaIngreso: addDays(t, -10) },
  ]

  const planes = [
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
  ]

  const actividades = [
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
  ]

  const memSeed = [
    { socioId: 'S001', planId: 'P02', inicioOffset: -20, actividadPreferida: 'A02', pagoEstado: 'pagado', metodo: 'Transferencia' },
    { socioId: 'S002', planId: 'P03', inicioOffset: -60, actividadPreferida: 'A03', pagoEstado: 'pagado', metodo: 'Débito' },
    { socioId: 'S003', planId: 'P01', inicioOffset: -33, actividadPreferida: 'A01', pagoEstado: 'pendiente', metodo: '—' },
    { socioId: 'S004', planId: 'P02', inicioOffset: -27, actividadPreferida: 'A04', pagoEstado: 'pagado', metodo: 'Transferencia' },
    { socioId: 'S005', planId: 'P04', inicioOffset: -14, actividadPreferida: 'A02', pagoEstado: 'pagado', metodo: 'Débito' },
    { socioId: 'S006', planId: 'P01', inicioOffset: -45, actividadPreferida: 'A01', pagoEstado: 'pendiente', metodo: '—' },
    { socioId: 'S007', planId: 'P02', inicioOffset: -5, actividadPreferida: 'A03', pagoEstado: 'pagado', metodo: 'Transferencia' },
    { socioId: 'S008', planId: 'P04', inicioOffset: -3, actividadPreferida: 'A01', pagoEstado: 'pagado', metodo: 'Efectivo' },
    { socioId: 'S009', planId: 'P02', inicioOffset: -1, actividadPreferida: 'A04', pagoEstado: 'pagado', metodo: 'Transferencia' },
  ]

  const membresias = []
  const pagos = []
  const inscripciones = []

  memSeed.forEach((m, idx) => {
    const plan = planes.find((p) => p.id === m.planId)
    const fechaInicio = addDays(t, m.inicioOffset)
    const fechaFin = addDays(fechaInicio, plan.duracionDias)
    const memId = 'M' + String(idx + 1).padStart(3, '0')
    const pagoId = 'PG' + String(idx + 1).padStart(3, '0')

    membresias.push({
      id: memId,
      socioId: m.socioId,
      planId: m.planId,
      fechaInicio,
      fechaFin,
      actividadPreferida: m.actividadPreferida,
    })

    pagos.push({
      id: pagoId,
      socioId: m.socioId,
      membresiaId: memId,
      monto: plan.precio,
      fecha: fechaInicio,
      metodo: m.metodo,
      estado: m.pagoEstado,
      comprobante: `BOL-2026-${String(idx + 1).padStart(4, '0')}`,
    })

    if (diasRestantes(fechaFin) >= 0 && m.actividadPreferida) {
      inscripciones.push({
        id: 'IN' + String(inscripciones.length + 1).padStart(3, '0'),
        socioId: m.socioId,
        actividadId: m.actividadPreferida,
        fechaInscripcion: fechaInicio,
        estado: 'confirmada',
        notas: 'Inscripción inicial por plan vigente',
      })
    }
  })

  const accessLogs = [
    {
      id: 'AS0001',
      socioId: 'S001',
      socioNombre: 'Camila Reyes',
      actividadId: 'A02',
      actividadNombre: 'Funcional HIIT',
      fecha: t,
      hora: '08:40',
      metodo: 'QR',
      autorizado: true,
      motivo: 'Membresía vigente verificada desde cámara Android',
      metadata: {
        estadoMembresia: 'activa',
        diasRestantes: 10,
        dispositivo: 'Cámara Móvil Android (APK)',
        ubicacion: 'Cancha Exterior Norte',
      },
    },
    {
      id: 'AS0002',
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
        dispositivo: 'Cámara Móvil Android (APK)',
        ubicacion: 'Torniquete Entrada',
      },
    },
  ]

  const bitacora = [
    {
      id: 'EV001',
      tipo: 'SISTEMA_SEED',
      modulo: 'sistema',
      descripcion: 'Inicialización de datos en ClubTrack Mobile Android.',
      actor: 'Sistema Android',
      entidadId: 'SEED-INIT',
      socioId: null,
      payload: { socios: socios.length, planes: planes.length },
      fecha: t,
      hora: '08:00',
    },
    {
      id: 'EV002',
      tipo: 'CHECKIN_DENEGADO',
      modulo: 'asistencia',
      descripcion: 'Intento de acceso QR rechazado para Valentina Soto por membresía vencida.',
      actor: 'Escáner Cámara Android',
      entidadId: 'S003',
      socioId: 'S003',
      payload: { actividadId: 'A01', metodo: 'QR', motivo: 'Membresía vencida' },
      fecha: t,
      hora: '09:12',
    },
  ]

  return {
    instructores,
    socios,
    planes,
    actividades,
    membresias,
    inscripciones,
    pagos,
    asistencias: accessLogs.filter((l) => l.autorizado),
    accessLogs,
    bitacora,
  }
}

function loadDb() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch {
    // fallback
  }
  const initial = buildInitialMobileSeed()
  saveDb(initial)
  return initial
}

function saveDb(db) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    // ignore
  }
}

function addAudit(db, { tipo, modulo, descripcion, entidadId = null, socioId = null, payload = {} }) {
  const ev = {
    id: uid('EV'),
    tipo,
    modulo,
    descripcion,
    actor: 'App Móvil Android',
    entidadId,
    socioId,
    payload,
    fecha: today(),
    hora: nowTime(),
  }
  db.bitacora = [ev, ...(db.bitacora || [])]
}

export function handleOfflineRequest(endpoint, { method = 'GET', body } = {}) {
  const db = loadDb()
  const cleanUrl = endpoint.split('?')[0]

  if (cleanUrl === '/bootstrap' && method === 'GET') {
    return db
  }

  if (cleanUrl === '/reset' && method === 'POST') {
    const fresh = buildInitialMobileSeed()
    saveDb(fresh)
    return fresh
  }

  // SOCIOS
  if (cleanUrl === '/socios' && method === 'GET') return db.socios
  if (cleanUrl === '/socios' && method === 'POST') {
    const nuevo = {
      id: uid('S'),
      nombre: body.nombre,
      email: body.email,
      telefono: body.telefono,
      fechaIngreso: body.fechaIngreso || today(),
    }
    db.socios.push(nuevo)
    addAudit(db, {
      tipo: 'SOCIO_CREADO',
      modulo: 'socios',
      descripcion: `Alta de socio ${nuevo.nombre} desde App Móvil.`,
      entidadId: nuevo.id,
      socioId: nuevo.id,
      payload: nuevo,
    })
    saveDb(db)
    return nuevo
  }
  if (cleanUrl.startsWith('/socios/')) {
    const id = cleanUrl.split('/')[2]
    if (method === 'GET') {
      const socio = db.socios.find((s) => s.id === id)
      return {
        socio,
        membresias: db.membresias.filter((m) => m.socioId === id),
        inscripciones: db.inscripciones.filter((i) => i.socioId === id),
        pagos: db.pagos.filter((p) => p.socioId === id),
        asistencias: db.accessLogs.filter((a) => a.socioId === id),
      }
    }
    if (method === 'PUT') {
      db.socios = db.socios.map((s) => (s.id === id ? { ...s, ...body, id } : s))
      saveDb(db)
      return db.socios.find((s) => s.id === id)
    }
    if (method === 'DELETE') {
      db.socios = db.socios.filter((s) => s.id !== id)
      db.membresias = db.membresias.filter((m) => m.socioId !== id)
      db.inscripciones = db.inscripciones.filter((i) => i.socioId !== id)
      db.pagos = db.pagos.filter((p) => p.socioId !== id)
      saveDb(db)
      return { deleted: true, id }
    }
  }

  // INSTRUCTORES
  if (cleanUrl === '/instructores' && method === 'GET') return db.instructores
  if (cleanUrl === '/instructores' && method === 'POST') {
    const nuevo = { id: uid('I'), activo: true, ...body }
    db.instructores.push(nuevo)
    saveDb(db)
    return nuevo
  }
  if (cleanUrl.startsWith('/instructores/')) {
    const id = cleanUrl.split('/')[2]
    if (method === 'PUT') {
      db.instructores = db.instructores.map((i) => (i.id === id ? { ...i, ...body, id } : i))
      saveDb(db)
      return db.instructores.find((i) => i.id === id)
    }
    if (method === 'DELETE') {
      db.instructores = db.instructores.filter((i) => i.id !== id)
      saveDb(db)
      return { deleted: true, id }
    }
  }

  // PLANES
  if (cleanUrl === '/planes' && method === 'GET') return db.planes
  if (cleanUrl === '/planes' && method === 'POST') {
    const nuevo = { id: uid('P'), ...body, precio: Number(body.precio), duracionDias: Number(body.duracionDias) }
    db.planes.push(nuevo)
    saveDb(db)
    return nuevo
  }
  if (cleanUrl.startsWith('/planes/')) {
    const id = cleanUrl.split('/')[2]
    if (method === 'PUT') {
      db.planes = db.planes.map((p) => (p.id === id ? { ...p, ...body, id } : p))
      saveDb(db)
      return db.planes.find((p) => p.id === id)
    }
    if (method === 'DELETE') {
      const enUso = db.membresias.some((m) => m.planId === id)
      if (enUso) {
        const err = new Error('No se puede eliminar: existen membresías asociadas a este plan.')
        err.status = 409
        throw err
      }
      db.planes = db.planes.filter((p) => p.id !== id)
      saveDb(db)
      return { deleted: true, id }
    }
  }

  // ACTIVIDADES
  if (cleanUrl === '/actividades' && method === 'GET') return db.actividades
  if (cleanUrl === '/actividades' && method === 'POST') {
    const inst = db.instructores.find((i) => i.id === body.instructorId)
    const nueva = {
      id: uid('A'),
      ...body,
      instructor: inst ? inst.nombre : body.instructor || 'Staff de sala',
      cupo: Number(body.cupo),
    }
    db.actividades.push(nueva)
    saveDb(db)
    return nueva
  }
  if (cleanUrl.startsWith('/actividades/')) {
    const id = cleanUrl.split('/')[2]
    if (method === 'PUT') {
      const inst = db.instructores.find((i) => i.id === body.instructorId)
      db.actividades = db.actividades.map((a) =>
        a.id === id
          ? { ...a, ...body, id, instructor: inst ? inst.nombre : body.instructor || a.instructor }
          : a,
      )
      saveDb(db)
      return db.actividades.find((a) => a.id === id)
    }
    if (method === 'DELETE') {
      db.actividades = db.actividades.filter((a) => a.id !== id)
      saveDb(db)
      return { deleted: true, id }
    }
  }

  // MEMBRESÍAS
  if (cleanUrl === '/membresias' && method === 'POST') {
    const plan = db.planes.find((p) => p.id === body.planId)
    const socio = db.socios.find((s) => s.id === body.socioId)
    const fechaInicio = body.inicio || today()
    const fechaFin = addDays(fechaInicio, plan ? plan.duracionDias : 30)
    const membresia = {
      id: uid('M'),
      socioId: body.socioId,
      planId: body.planId,
      fechaInicio,
      fechaFin,
      actividadPreferida: body.actividadPreferida || null,
    }
    const pago = {
      id: uid('PG'),
      socioId: body.socioId,
      membresiaId: membresia.id,
      monto: plan ? plan.precio : 25000,
      fecha: fechaInicio,
      metodo: '—',
      estado: 'pendiente',
      comprobante: generateComprobante(),
    }
    db.membresias.push(membresia)
    db.pagos.unshift(pago)
    addAudit(db, {
      tipo: 'MEMBRESIA_CREADA',
      modulo: 'membresias',
      descripcion: `Alta de membresía para ${socio?.nombre || body.socioId}.`,
      entidadId: membresia.id,
      socioId: body.socioId,
      payload: { membresia, pago },
    })
    saveDb(db)
    return { membresia, pago }
  }

  if (cleanUrl.endsWith('/renovar') && method === 'POST') {
    const id = cleanUrl.split('/')[2]
    const actual = db.membresias.find((m) => m.id === id)
    const plan = db.planes.find((p) => p.id === actual?.planId)
    const fechaInicio = today()
    const fechaFin = addDays(fechaInicio, plan ? plan.duracionDias : 30)
    const membresia = {
      id: uid('M'),
      socioId: actual.socioId,
      planId: actual.planId,
      fechaInicio,
      fechaFin,
      actividadPreferida: actual.actividadPreferida,
    }
    const pago = {
      id: uid('PG'),
      socioId: actual.socioId,
      membresiaId: membresia.id,
      monto: plan ? plan.precio : 25000,
      fecha: fechaInicio,
      metodo: '—',
      estado: 'pendiente',
      comprobante: generateComprobante(),
    }
    db.membresias.push(membresia)
    db.pagos.unshift(pago)
    saveDb(db)
    return { membresia, pago }
  }

  // INSCRIPCIONES
  if (cleanUrl === '/inscripciones' && method === 'POST') {
    const mems = db.membresias
      .filter((m) => m.socioId === body.socioId)
      .sort((a, b) => (a.fechaFin < b.fechaFin ? 1 : -1))
    if (mems.length === 0 || estadoMembresia(mems[0].fechaFin) === 'vencida') {
      const err = new Error('No se puede inscribir al socio porque su membresía está vencida.')
      err.status = 422
      throw err
    }
    const dup = db.inscripciones.some(
      (i) => i.socioId === body.socioId && i.actividadId === body.actividadId && i.estado === 'confirmada',
    )
    if (dup) {
      const err = new Error('El socio ya tiene una inscripción confirmada en esta actividad.')
      err.status = 409
      throw err
    }
    const act = db.actividades.find((a) => a.id === body.actividadId)
    const ocupados = db.inscripciones.filter(
      (i) => i.actividadId === body.actividadId && i.estado === 'confirmada',
    ).length
    if (act && ocupados >= act.cupo) {
      const err = new Error(`No quedan cupos disponibles en ${act.nombre} (cupo máximo: ${act.cupo}).`)
      err.status = 409
      throw err
    }
    const nueva = {
      id: uid('IN'),
      socioId: body.socioId,
      actividadId: body.actividadId,
      fechaInscripcion: today(),
      estado: 'confirmada',
      notas: body.notas || '',
    }
    db.inscripciones.unshift(nueva)
    saveDb(db)
    return nueva
  }

  if (cleanUrl.startsWith('/inscripciones/')) {
    const parts = cleanUrl.split('/')
    const id = parts[2]
    if (parts[3] === 'estado' && method === 'PATCH') {
      db.inscripciones = db.inscripciones.map((i) => (i.id === id ? { ...i, estado: body.estado } : i))
      saveDb(db)
      return db.inscripciones.find((i) => i.id === id)
    }
    if (method === 'DELETE') {
      db.inscripciones = db.inscripciones.filter((i) => i.id !== id)
      saveDb(db)
      return { deleted: true, id }
    }
  }

  // PAGOS
  if (cleanUrl === '/pagos' && method === 'POST') {
    const nuevo = {
      id: uid('PG'),
      socioId: body.socioId,
      membresiaId: body.membresiaId || null,
      monto: Number(body.monto),
      fecha: body.fecha || today(),
      metodo: body.metodo || 'Transferencia',
      estado: body.estado || 'pagado',
      comprobante: generateComprobante(),
    }
    db.pagos.unshift(nuevo)
    saveDb(db)
    return nuevo
  }
  if (cleanUrl.endsWith('/pagar') && method === 'PATCH') {
    const id = cleanUrl.split('/')[2]
    db.pagos = db.pagos.map((p) =>
      p.id === id
        ? { ...p, estado: 'pagado', metodo: body?.metodo || (p.metodo === '—' ? 'Transferencia' : p.metodo), fecha: today() }
        : p,
    )
    saveDb(db)
    return db.pagos.find((p) => p.id === id)
  }

  // CHECK-IN QR (MÓVIL & WEB)
  if (cleanUrl === '/asistencias/checkin' && method === 'POST') {
    const q = String(body.codigo || '').trim().toLowerCase()
    const socio = db.socios.find((s) => s.id.toLowerCase() === q || s.email.toLowerCase() === q)
    if (!socio) {
      const err = new Error(`No existe ningún socio con el código o correo "${body.codigo}".`)
      err.status = 404
      throw err
    }
    const act = db.actividades.find((a) => a.id === body.actividadId) || db.actividades[0]
    const mems = db.membresias
      .filter((m) => m.socioId === socio.id)
      .sort((a, b) => (a.fechaFin < b.fechaFin ? 1 : -1))
    const mem = mems[0]
    const est = mem ? estadoMembresia(mem.fechaFin) : 'vencida'
    const dias = mem ? diasRestantes(mem.fechaFin) : -99

    if (!mem || est === 'vencida') {
      const deniedLog = {
        id: uid('AS'),
        socioId: socio.id,
        socioNombre: socio.nombre,
        actividadId: act?.id || 'A01',
        actividadNombre: act?.nombre || 'General',
        fecha: today(),
        hora: nowTime(),
        metodo: body.metodo || 'QR',
        autorizado: false,
        motivo: !mem ? 'Acceso denegado: Socio sin membresía' : `Acceso denegado: Membresía vencida (${mem.fechaFin})`,
        metadata: {
          estadoMembresia: 'vencida',
          diasRestantes: dias,
          dispositivo: 'Escáner Cámara Android (APK)',
          ubicacion: act?.ubicacion || 'Recepción Móvil',
        },
      }
      db.accessLogs.unshift(deniedLog)
      addAudit(db, {
        tipo: 'CHECKIN_DENEGADO',
        modulo: 'asistencia',
        descripcion: `Ingreso QR rechazado en cámara Android para ${socio.nombre}.`,
        entidadId: deniedLog.id,
        socioId: socio.id,
        payload: deniedLog,
      })
      saveDb(db)
      const err = new Error(deniedLog.motivo)
      err.status = 422
      err.details = { accessLog: deniedLog }
      throw err
    }

    const okLog = {
      id: uid('AS'),
      socioId: socio.id,
      socioNombre: socio.nombre,
      actividadId: act?.id || 'A01',
      actividadNombre: act?.nombre || 'General',
      fecha: today(),
      hora: nowTime(),
      metodo: body.metodo || 'QR',
      autorizado: true,
      motivo: 'Membresía vigente verificada por cámara móvil',
      metadata: {
        estadoMembresia: est,
        diasRestantes: dias,
        dispositivo: 'Escáner Cámara Android (APK)',
        ubicacion: act?.ubicacion || 'Recepción Móvil',
      },
    }
    db.accessLogs.unshift(okLog)
    db.asistencias.unshift(okLog)
    addAudit(db, {
      tipo: 'CHECKIN_AUTORIZADO',
      modulo: 'asistencia',
      descripcion: `Check-in QR móvil autorizado para ${socio.nombre}.`,
      entidadId: okLog.id,
      socioId: socio.id,
      payload: okLog,
    })
    saveDb(db)
    return {
      socio,
      asistencia: okLog,
      estadoMembresia: est,
      diasRestantes: dias,
    }
  }

  if (cleanUrl === '/asistencias' && method === 'GET') return db.accessLogs
  if (cleanUrl === '/bitacora' && method === 'GET') return db.bitacora

  return {}
}
