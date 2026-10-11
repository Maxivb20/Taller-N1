/* =========================================================
   ClubTrack — data.js
   Fuente de datos simulada (localStorage) + utilidades comunes.
   No hay backend: todo el estado vive en el navegador para
   efectos de la actividad evaluada (frontend puro).
   ========================================================= */

const DB_KEYS = {
  socios: 'ct_socios',
  planes: 'ct_planes',
  membresias: 'ct_membresias',
  pagos: 'ct_pagos',
  actividades: 'ct_actividades',
  asistencias: 'ct_asistencias',
  seeded: 'ct_seeded_v1'
};

function addDays(dateStr, days){
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0,10);
}

function today(){
  return new Date().toISOString().slice(0,10);
}

function daysBetween(fromStr, toStr){
  const a = new Date(fromStr + 'T00:00:00');
  const b = new Date(toStr + 'T00:00:00');
  return Math.round((b - a) / 86400000);
}

function formatDateDisplay(dateStr){
  if(!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatMoney(n){
  return '$' + Number(n).toLocaleString('es-CL');
}

function uid(prefix){
  return prefix + '_' + Math.random().toString(36).slice(2, 9);
}

/* ---------- Semilla de datos ---------- */

function seedDatabase(){
  if(localStorage.getItem(DB_KEYS.seeded)) return;

  const t = today();

  const socios = [
    { id: 'S001', nombre: 'Camila Reyes',    email: 'camila.reyes@mail.com',   telefono: '+56 9 8123 4501', fechaIngreso: addDays(t, -220) },
    { id: 'S002', nombre: 'Matías Fuentes',  email: 'matias.fuentes@mail.com', telefono: '+56 9 8123 4502', fechaIngreso: addDays(t, -190) },
    { id: 'S003', nombre: 'Valentina Soto',  email: 'valentina.soto@mail.com', telefono: '+56 9 8123 4503', fechaIngreso: addDays(t, -160) },
    { id: 'S004', nombre: 'Benjamín Rojas',  email: 'benjamin.rojas@mail.com', telefono: '+56 9 8123 4504', fechaIngreso: addDays(t, -140) },
    { id: 'S005', nombre: 'Francisca Muñoz', email: 'francisca.munoz@mail.com',telefono: '+56 9 8123 4505', fechaIngreso: addDays(t, -95) },
    { id: 'S006', nombre: 'Diego Castillo',  email: 'diego.castillo@mail.com', telefono: '+56 9 8123 4506', fechaIngreso: addDays(t, -70) },
    { id: 'S007', nombre: 'Antonia Vargas',  email: 'antonia.vargas@mail.com', telefono: '+56 9 8123 4507', fechaIngreso: addDays(t, -45) },
    { id: 'S008', nombre: 'Ignacio Herrera', email: 'ignacio.herrera@mail.com',telefono: '+56 9 8123 4508', fechaIngreso: addDays(t, -20) },
    { id: 'S009', nombre: 'Josefa Contreras',email: 'josefa.contreras@mail.com',telefono: '+56 9 8123 4509', fechaIngreso: addDays(t, -10) },
  ];

  const planes = [
    { id: 'P01', nombre: 'Plan Básico',    descripcion: 'Acceso a sala de musculación en horario diurno.', precio: 24990, duracionDias: 30, actividades: ['Musculación'] },
    { id: 'P02', nombre: 'Plan Full',      descripcion: 'Acceso ilimitado a todas las actividades del club.', precio: 39990, duracionDias: 30, actividades: ['Musculación','Funcional','Spinning','Yoga'] },
    { id: 'P03', nombre: 'Plan Trimestral',descripcion: 'Plan Full con permanencia trimestral y descuento.', precio: 99990, duracionDias: 90, actividades: ['Musculación','Funcional','Spinning','Yoga'] },
    { id: 'P04', nombre: 'Plan Estudiante',descripcion: 'Tarifa preferencial acreditando matrícula vigente.', precio: 17990, duracionDias: 30, actividades: ['Musculación','Funcional'] },
  ];

  const actividades = [
    { id: 'A01', nombre: 'Musculación libre', instructor: 'Staff de sala', horario: 'Lun a Sáb · 07:00–22:00', cupo: 40 },
    { id: 'A02', nombre: 'Funcional HIIT',     instructor: 'Rodrigo Paredes', horario: 'Lun / Mié / Vie · 19:00', cupo: 18 },
    { id: 'A03', nombre: 'Spinning',           instructor: 'Camila Ortiz',    horario: 'Mar / Jue · 08:00', cupo: 20 },
    { id: 'A04', nombre: 'Yoga',               instructor: 'Paula Andrade',   horario: 'Mar / Jue / Sáb · 09:30', cupo: 15 },
  ];

  // Membresías: mezcla de estados (activa, por vencer, vencida)
  const membresiasSeed = [
    { socioId: 'S001', planId: 'P02', inicioOffset: -30, actividadPreferida: 'A02' },
    { socioId: 'S002', planId: 'P03', inicioOffset: -60, actividadPreferida: 'A03' },
    { socioId: 'S003', planId: 'P01', inicioOffset: -33, actividadPreferida: 'A01' }, // vencida hace poco
    { socioId: 'S004', planId: 'P02', inicioOffset: -27, actividadPreferida: 'A04' }, // por vencer
    { socioId: 'S005', planId: 'P04', inicioOffset: -14, actividadPreferida: 'A02' },
    { socioId: 'S006', planId: 'P01', inicioOffset: -45, actividadPreferida: 'A01' }, // vencida
    { socioId: 'S007', planId: 'P02', inicioOffset: -5,  actividadPreferida: 'A03' },
    { socioId: 'S008', planId: 'P04', inicioOffset: -3,  actividadPreferida: 'A01' },
    { socioId: 'S009', planId: 'P02', inicioOffset: -1,  actividadPreferida: 'A04' },
  ];

  const membresias = [];
  const pagos = [];
  let payCounter = 1;

  membresiasSeed.forEach((m, idx) => {
    const plan = planes.find(p => p.id === m.planId);
    const fechaInicio = addDays(t, m.inicioOffset);
    const fechaFin = addDays(fechaInicio, plan.duracionDias);
    const memId = 'M' + String(idx + 1).padStart(3, '0');
    membresias.push({
      id: memId,
      socioId: m.socioId,
      planId: m.planId,
      fechaInicio,
      fechaFin,
      actividadPreferida: m.actividadPreferida
    });

    // Pago asociado (la mayoría pagado, un par pendiente para poblar morosidad)
    const pendiente = (m.socioId === 'S003' || m.socioId === 'S006');
    pagos.push({
      id: 'PG' + String(payCounter++).padStart(3, '0'),
      socioId: m.socioId,
      membresiaId: memId,
      monto: plan.precio,
      fecha: fechaInicio,
      metodo: pendiente ? '—' : (idx % 2 === 0 ? 'Transferencia' : 'Débito'),
      estado: pendiente ? 'pendiente' : 'pagado'
    });
  });

  // Asistencias simuladas de los últimos 7 días
  const asistencias = [];
  let asisCounter = 1;
  const activos = membresias.filter(m => daysBetween(t, m.fechaFin) >= 0);
  for(let offset = 6; offset >= 0; offset--){
    const fecha = addDays(t, -offset);
    // cada día, un subconjunto aleatorio-determinístico de socios activos asiste
    activos.forEach((m, i) => {
      if((i + offset) % 3 !== 0) return; // patrón simple y reproducible
      const hora = ['07:15','08:40','12:05','18:30','19:50'][(i + offset) % 5];
      asistencias.push({
        id: 'AS' + String(asisCounter++).padStart(4, '0'),
        socioId: m.socioId,
        actividadId: m.actividadPreferida,
        fecha,
        hora,
        metodo: (i % 2 === 0) ? 'QR' : 'Manual'
      });
    });
  }

  localStorage.setItem(DB_KEYS.socios, JSON.stringify(socios));
  localStorage.setItem(DB_KEYS.planes, JSON.stringify(planes));
  localStorage.setItem(DB_KEYS.membresias, JSON.stringify(membresias));
  localStorage.setItem(DB_KEYS.pagos, JSON.stringify(pagos));
  localStorage.setItem(DB_KEYS.actividades, JSON.stringify(actividades));
  localStorage.setItem(DB_KEYS.asistencias, JSON.stringify(asistencias));
  localStorage.setItem(DB_KEYS.seeded, 'true');
}

function resetDatabase(){
  Object.values(DB_KEYS).forEach(k => localStorage.removeItem(k));
  seedDatabase();
}

/* ---------- Accesores genéricos ---------- */

function getAll(key){
  return JSON.parse(localStorage.getItem(DB_KEYS[key]) || '[]');
}
function saveAll(key, arr){
  localStorage.setItem(DB_KEYS[key], JSON.stringify(arr));
}

function getSocios(){ return getAll('socios'); }
function getPlanes(){ return getAll('planes'); }
function getMembresias(){ return getAll('membresias'); }
function getPagos(){ return getAll('pagos'); }
function getActividades(){ return getAll('actividades'); }
function getAsistencias(){ return getAll('asistencias'); }

function getSocioById(id){ return getSocios().find(s => s.id === id); }
function getPlanById(id){ return getPlanes().find(p => p.id === id); }
function getActividadById(id){ return getActividades().find(a => a.id === id); }

/* ---------- Reglas de negocio: vigencia de membresía ---------- */

const UMBRAL_POR_VENCER = 7; // días

function estadoMembresia(membresia){
  const restantes = daysBetween(today(), membresia.fechaFin);
  if(restantes < 0) return 'vencida';
  if(restantes <= UMBRAL_POR_VENCER) return 'por_vencer';
  return 'activa';
}

function diasRestantes(membresia){
  return daysBetween(today(), membresia.fechaFin);
}

// Membresía vigente (más reciente) de un socio
function membresiaVigenteDe(socioId){
  const mems = getMembresias().filter(m => m.socioId === socioId);
  if(mems.length === 0) return null;
  mems.sort((a, b) => new Date(b.fechaFin) - new Date(a.fechaFin));
  return mems[0];
}

function badgeEstadoHtml(estado){
  const labels = { activa: 'Activa', por_vencer: 'Por vencer', vencida: 'Vencida', pagado: 'Pagado', pendiente: 'Pendiente' };
  return `<span class="badge-estado badge-${estado}">${labels[estado] || estado}</span>`;
}

/* Inicializar apenas se carga el script en cualquier página */
seedDatabase();
