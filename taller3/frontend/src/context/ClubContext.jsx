/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react'
import { clubApi } from '../services/clubService'

const ClubContext = createContext(null)

const INITIAL_STATE = {
  cargando: true,
  error: null,
  instructores: [],
  socios: [],
  planes: [],
  actividades: [],
  membresias: [],
  inscripciones: [],
  pagos: [],
  asistencias: [],
  accessLogs: [],
  bitacora: [],
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOADING':
      return { ...state, cargando: true, error: null }
    case 'ERROR':
      return { ...state, cargando: false, error: action.payload }
    case 'SET_DATA':
      return {
        ...state,
        cargando: false,
        error: null,
        instructores: action.payload.instructores || [],
        socios: action.payload.socios || [],
        planes: action.payload.planes || [],
        actividades: action.payload.actividades || [],
        membresias: action.payload.membresias || [],
        inscripciones: action.payload.inscripciones || [],
        pagos: action.payload.pagos || [],
        asistencias: action.payload.asistencias || [],
        accessLogs: action.payload.accessLogs || [],
        bitacora: action.payload.bitacora || [],
      }

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
        inscripciones: state.inscripciones.filter((i) => i.socioId !== action.payload.id),
        pagos: state.pagos.filter((p) => p.socioId !== action.payload.id),
        asistencias: state.asistencias.filter((a) => a.socioId !== action.payload.id),
        accessLogs: state.accessLogs.filter((l) => l.socioId !== action.payload.id),
      }

    /* ---------- Instructores ---------- */
    case 'ADD_INSTRUCTOR':
      return { ...state, instructores: [...state.instructores, action.payload] }
    case 'UPDATE_INSTRUCTOR':
      return {
        ...state,
        instructores: state.instructores.map((i) =>
          i.id === action.payload.id ? { ...i, ...action.payload } : i,
        ),
      }
    case 'DELETE_INSTRUCTOR':
      return {
        ...state,
        instructores: state.instructores.filter((i) => i.id !== action.payload.id),
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
        actividades: state.actividades.map((a) =>
          a.id === action.payload.id ? { ...a, ...action.payload } : a,
        ),
      }
    case 'DELETE_ACTIVIDAD':
      return { ...state, actividades: state.actividades.filter((a) => a.id !== action.payload.id) }

    /* ---------- Membresías ---------- */
    case 'ADD_MEMBRESIA':
    case 'RENOVAR_MEMBRESIA':
      return {
        ...state,
        membresias: [...state.membresias, action.payload.membresia],
        pagos: [action.payload.pago, ...state.pagos],
      }

    /* ---------- Inscripciones ---------- */
    case 'ADD_INSCRIPCION':
      return { ...state, inscripciones: [action.payload, ...state.inscripciones] }
    case 'UPDATE_INSCRIPCION':
      return {
        ...state,
        inscripciones: state.inscripciones.map((i) =>
          i.id === action.payload.id ? { ...i, ...action.payload } : i,
        ),
      }
    case 'DELETE_INSCRIPCION':
      return {
        ...state,
        inscripciones: state.inscripciones.filter((i) => i.id !== action.payload.id),
      }

    /* ---------- Pagos ---------- */
    case 'ADD_PAGO':
      return { ...state, pagos: [action.payload, ...state.pagos] }
    case 'MARCAR_PAGADO':
      return {
        ...state,
        pagos: state.pagos.map((p) => (p.id === action.payload.id ? action.payload : p)),
      }

    /* ---------- Asistencias / Logs (MongoDB) ---------- */
    case 'ADD_ASISTENCIA':
      return {
        ...state,
        asistencias: action.payload.autorizado
          ? [action.payload, ...state.asistencias]
          : state.asistencias,
        accessLogs: [action.payload, ...state.accessLogs],
      }

    default:
      return state
  }
}

export function ClubProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  const recargar = useCallback(async () => {
    dispatch({ type: 'LOADING' })
    try {
      const data = await clubApi.obtenerBootstrap()
      dispatch({ type: 'SET_DATA', payload: data })
      return data
    } catch (err) {
      dispatch({ type: 'ERROR', payload: err.message || 'Error al cargar los datos del servidor.' })
      throw err
    }
  }, [])

  useEffect(() => {
    recargar().catch(() => {})
  }, [recargar])

  const refrescarBitacora = useCallback(async () => {
    try {
      const data = await clubApi.obtenerBootstrap()
      dispatch({ type: 'SET_DATA', payload: data })
    } catch {
      // Silencioso en refrescos secundarios
    }
  }, [])

  const acciones = useMemo(
    () => ({
      recargar,

      /* Socios */
      agregarSocio: async (socio) => {
        const creado = await clubApi.crearSocio(socio)
        dispatch({ type: 'ADD_SOCIO', payload: creado })
        refrescarBitacora()
        return creado
      },
      editarSocio: async (socio) => {
        const actualizado = await clubApi.editarSocio(socio.id, socio)
        dispatch({ type: 'UPDATE_SOCIO', payload: actualizado })
        refrescarBitacora()
        return actualizado
      },
      eliminarSocio: async (id) => {
        await clubApi.eliminarSocio(id)
        dispatch({ type: 'DELETE_SOCIO', payload: { id } })
        refrescarBitacora()
      },

      /* Instructores */
      agregarInstructor: async (inst) => {
        const creado = await clubApi.crearInstructor(inst)
        dispatch({ type: 'ADD_INSTRUCTOR', payload: creado })
        return creado
      },
      editarInstructor: async (inst) => {
        const actualizado = await clubApi.editarInstructor(inst.id, inst)
        dispatch({ type: 'UPDATE_INSTRUCTOR', payload: actualizado })
        return actualizado
      },
      eliminarInstructor: async (id) => {
        await clubApi.eliminarInstructor(id)
        dispatch({ type: 'DELETE_INSTRUCTOR', payload: { id } })
      },

      /* Planes */
      agregarPlan: async (plan) => {
        const creado = await clubApi.crearPlan(plan)
        dispatch({ type: 'ADD_PLAN', payload: creado })
        return creado
      },
      editarPlan: async (plan) => {
        const actualizado = await clubApi.editarPlan(plan.id, plan)
        dispatch({ type: 'UPDATE_PLAN', payload: actualizado })
        return actualizado
      },
      eliminarPlan: async (id) => {
        await clubApi.eliminarPlan(id)
        dispatch({ type: 'DELETE_PLAN', payload: { id } })
      },

      /* Actividades */
      agregarActividad: async (act) => {
        const creada = await clubApi.crearActividad(act)
        dispatch({ type: 'ADD_ACTIVIDAD', payload: creada })
        return creada
      },
      editarActividad: async (act) => {
        const actualizada = await clubApi.editarActividad(act.id, act)
        dispatch({ type: 'UPDATE_ACTIVIDAD', payload: actualizada })
        return actualizada
      },
      eliminarActividad: async (id) => {
        await clubApi.eliminarActividad(id)
        dispatch({ type: 'DELETE_ACTIVIDAD', payload: { id } })
      },

      /* Membresías */
      agregarMembresia: async ({ socioId, planId, inicio, actividadPreferida }) => {
        const res = await clubApi.crearMembresia({ socioId, planId, inicio, actividadPreferida })
        dispatch({ type: 'ADD_MEMBRESIA', payload: res })
        refrescarBitacora()
        return res
      },
      renovarMembresia: async (mem) => {
        const res = await clubApi.renovarMembresia(mem.id)
        dispatch({ type: 'RENOVAR_MEMBRESIA', payload: res })
        refrescarBitacora()
        return res
      },

      /* Inscripciones y Control de Cupos */
      agregarInscripcion: async ({ socioId, actividadId, notas }) => {
        const creada = await clubApi.crearInscripcion({ socioId, actividadId, notas })
        dispatch({ type: 'ADD_INSCRIPCION', payload: creada })
        refrescarBitacora()
        return creada
      },
      cambiarEstadoInscripcion: async (id, estado) => {
        const actualizada = await clubApi.cambiarEstadoInscripcion(id, estado)
        dispatch({ type: 'UPDATE_INSCRIPCION', payload: actualizada })
        refrescarBitacora()
        return actualizada
      },
      eliminarInscripcion: async (id) => {
        await clubApi.eliminarInscripcion(id)
        dispatch({ type: 'DELETE_INSCRIPCION', payload: { id } })
      },

      /* Pagos */
      agregarPago: async (pago) => {
        const creado = await clubApi.crearPago(pago)
        dispatch({ type: 'ADD_PAGO', payload: creado })
        refrescarBitacora()
        return creado
      },
      marcarPagado: async (id, metodo) => {
        const actualizado = await clubApi.marcarPagado(id, metodo)
        dispatch({ type: 'MARCAR_PAGADO', payload: actualizado })
        refrescarBitacora()
        return actualizado
      },

      /* Asistencia / Check-in (MongoDB) */
      registrarAsistencia: async ({ codigo, socioId, actividadId, metodo }) => {
        try {
          const res = await clubApi.registrarCheckin({ codigo, socioId, actividadId, metodo })
          dispatch({ type: 'ADD_ASISTENCIA', payload: res.asistencia })
          refrescarBitacora()
          return res
        } catch (err) {
          if (err.details?.accessLog) {
            dispatch({ type: 'ADD_ASISTENCIA', payload: err.details.accessLog })
            refrescarBitacora()
          }
          throw err
        }
      },

      /* Reiniciar datos de ejemplo */
      reiniciarDatos: async () => {
        const data = await clubApi.reiniciarDatos()
        dispatch({ type: 'SET_DATA', payload: data })
        return data
      },
    }),
    [recargar, refrescarBitacora],
  )

  const value = useMemo(() => ({ ...state, acciones }), [state, acciones])

  return <ClubContext.Provider value={value}>{children}</ClubContext.Provider>
}

export function useClub() {
  const ctx = useContext(ClubContext)
  if (!ctx) throw new Error('useClub debe usarse dentro de <ClubProvider>')
  return ctx
}

export { ClubContext }
