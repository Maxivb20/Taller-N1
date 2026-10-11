import { useEffect, useState } from 'react'
import { obtenerClimaLocal } from '../services/weatherApi'

// Hook que encapsula el consumo de la API pública y sus estados carga/error.
export function useWeather() {
  const [clima, setClima] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

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
  }, [])

  return { clima, cargando, error }
}
