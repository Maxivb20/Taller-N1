import { useCallback, useEffect, useState } from 'react'
import { obtenerClimaLocal } from '../services/weatherApi'

// Hook que encapsula el consumo de la API pública y sus estados carga/error/reintento.
export function useWeather() {
  const [clima, setClima] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [intento, setIntento] = useState(0)

  const refetch = useCallback(() => {
    setCargando(true)
    setError(null)
    setIntento((n) => n + 1)
  }, [])

  useEffect(() => {
    let activo = true

    obtenerClimaLocal()
      .then((datos) => {
        if (activo) setClima(datos)
      })
      .catch((err) => {
        if (activo) setError(err.message || 'No fue posible obtener el clima.')
      })
      .finally(() => {
        if (activo) setCargando(false)
      })

    return () => {
      activo = false
    }
  }, [intento])

  return { clima, cargando, error, refetch }
}
