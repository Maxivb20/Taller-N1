/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { loadDB, saveDB, resetDB, uid } from '../services/clubService'
import { today, addDays } from '../utils/dates'

const ClubContext = createContext(null)

function reducer(state, action) {
  switch (action.type) {
    /* ---------- Socios ---------- */
    case 'ADD_SOCIO':
      return { ...state, socios: [...state.socios, action.payload] }
    case 'UPDATE_SOCIO':
      return {
        ...state,
        socios: state.socios.map((s) => (s.id === action.payload.id ? { ...s, ...action.payload } : s)),
      }
    case 'DELETE_SOCIO':
      return {
        ...state,
        socios: state.socios.filter((s) => s.id !== action.payload.id),
        membresias: state.membresias.filter((m) => m.socioId !== action.payload.id),
        pagos: state.pagos.filter((p) => p.socioId !== action.payload.id),
        asistencias: state.asistencias.filter((a) => a.socioId !== action.payload.id),
      }

    /* ---------- Planes ---------- */
    case 'ADD_PLAN':
      return { ...state, planes: [...state.planes, action.payload] }
    case 'UPDATE_PLAN':
      return {
        ...state,
        planes: state.planes.map((p) => (p.id === action.payload.id ? { ...p, ...action.payload } : p)),
      }
    case 'DELETE_PLAN':
      return { ...state, planes: state.planes.filter((p) => p.id !== action.payload.id) }

    /* ---------- Actividades ---------- */
    case 'ADD_ACTIVIDAD':
      return { ...state, actividades: [...state.actividades, action.payload] }
    case 'UPDATE_ACTIVIDAD':
      return {
        ...state,
        actividades: state.actividades.map((a) => (a.id === action.payload.id ? { ...a, ...action.payload } : a)),
      }
    case 'DELETE_ACTIVIDAD':
      return { ...state, actividades: state.actividades.filter((a) => a.id !== action.payload.id) }

    /* ---------- Membresías ---------- */
    case 'ADD_MEMBRESIA':
      return {
        ...state,
        membresias: [...state.membresias, action.payload.membresia],
        pagos: [...state.pagos, action.payload.pago],
      }
    case 'RENOVAR_MEMBRESIA':
      return {
        ...state,
        membresias: [...state.membresias, action.payload.membresia],
        pagos: [...state.pagos, action.payload.pago],
      }

    /* ---------- Pagos ---------- */
    case 'ADD_PAGO':
      return { ...state, pagos: [...state.pagos, action.payload] }
    case 'MARCAR_PAGADO':
      return {
        ...state,
        pagos: state.pagos.map((p) =>
          p.id === action.payload.id
            ? { ...p, estado: 'pagado', metodo: p.metodo === '—' ? 'Efectivo' : p.metodo }
            : p,
        ),
      }

    /* ---------- Asistencias ---------- */
    case 'ADD_ASISTENCIA':
      return { ...state, asistencias: [...state.asistencias, action.payload] }

    /* ---------- Sistema ---------- */
    case 'RESET':
      return action.payload

    default:
      return state
  }
}

export function ClubProvider({ children }) {
  const [db, dispatch] = useReducer(reducer, null, loadDB)

  // Toda mutación del estado se persiste automáticamente en localStorage.
  useEffect(() => {
    saveDB(db)
  }, [db])

  const acciones = useMemo(
    () => ({
      agregarSocio: (socio) =>
        dispatch({
          type: 'ADD_SOCIO',
          payload: { ...socio, id: uid('S'), fechaIngreso: today() },
        }),
      editarSocio: (socio) => dispatch({ type: 'UPDATE_SOCIO', payload: socio }),
      eliminarSocio: (id) => dispatch({ type: 'DELETE_SOCIO', payload: { id } }),

      agregarPlan: (plan) => dispatch({ type: 'ADD_PLAN', payload: { ...plan, id: uid('P') } }),
      editarPlan: (plan) => dispatch({ type: 'UPDATE_PLAN', payload: plan }),
      eliminarPlan: (id) => dispatch({ type: 'DELETE_PLAN', payload: { id } }),

      agregarActividad: (act) => dispatch({ type: 'ADD_ACTIVIDAD', payload: { ...act, id: uid('A') } }),
      editarActividad: (act) => dispatch({ type: 'UPDATE_ACTIVIDAD', payload: act }),
      eliminarActividad: (id) => dispatch({ type: 'DELETE_ACTIVIDAD', payload: { id } }),

      agregarMembresia: ({ socioId, planId, inicio, actividadPreferida, plan }) => {
        const memId = uid('M')
        const membresia = {
          id: memId,
          socioId,
          planId,
          fechaInicio: inicio,
          fechaFin: addDays(inicio, plan.duracionDias),
          actividadPreferida: actividadPreferida || null,
        }
        const pago = {
          id: uid('PG'),
          socioId,
          membresiaId: memId,
          monto: plan.precio,
          fecha: inicio,
          metodo: '—',
          estado: 'pendiente',
        }
        dispatch({ type: 'ADD_MEMBRESIA', payload: { membresia, pago } })
      },
      renovarMembresia: (mem, plan) => {
        const memId = uid('M')
        const inicio = today()
        const membresia = {
          id: memId,
          socioId: mem.socioId,
          planId: mem.planId,
          fechaInicio: inicio,
          fechaFin: addDays(inicio, plan.duracionDias),
          actividadPreferida: mem.actividadPreferida,
        }
        const pago = {
          id: uid('PG'),
          socioId: mem.socioId,
          membresiaId: memId,
          monto: plan.precio,
          fecha: inicio,
          metodo: '—',
          estado: 'pendiente',
        }
        dispatch({ type: 'RENOVAR_MEMBRESIA', payload: { membresia, pago } })
      },

      agregarPago: (pago) =>
        dispatch({ type: 'ADD_PAGO', payload: { ...pago, id: uid('PG'), fecha: today() } }),
      marcarPagado: (id) => dispatch({ type: 'MARCAR_PAGADO', payload: { id } }),

      registrarAsistencia: ({ socioId, actividadId, metodo }) =>
        dispatch({
          type: 'ADD_ASISTENCIA',
          payload: {
            id: uid('AS'),
            socioId,
            actividadId,
            fecha: today(),
            hora: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
            metodo,
          },
        }),

      reiniciarDatos: () => dispatch({ type: 'RESET', payload: resetDB() }),
    }),
    [],
  )

  const value = useMemo(() => ({ ...db, acciones }), [db, acciones])

  return <ClubContext.Provider value={value}>{children}</ClubContext.Provider>
}

export function useClub() {
  const ctx = useContext(ClubContext)
  if (!ctx) throw new Error('useClub debe usarse dentro de <ClubProvider>')
  return ctx
}

export { ClubContext }
