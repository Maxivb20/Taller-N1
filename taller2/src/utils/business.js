import { today, daysBetween } from './dates'

export const UMBRAL_POR_VENCER = 7

export function diasRestantes(membresia) {
  return daysBetween(today(), membresia.fechaFin)
}

export function estadoMembresia(membresia) {
  const restantes = diasRestantes(membresia)
  if (restantes < 0) return 'vencida'
  if (restantes <= UMBRAL_POR_VENCER) return 'por_vencer'
  return 'activa'
}

// Devuelve la membresía más reciente (por fechaFin) de un socio
export function membresiaVigenteDe(membresias, socioId) {
  const mems = membresias.filter((m) => m.socioId === socioId)
  if (mems.length === 0) return null
  return [...mems].sort((a, b) => new Date(b.fechaFin) - new Date(a.fechaFin))[0]
}

export const ESTADO_LABEL = {
  activa: 'Activa',
  por_vencer: 'Por vencer',
  vencida: 'Vencida',
  pagado: 'Pagado',
  pendiente: 'Pendiente',
}
