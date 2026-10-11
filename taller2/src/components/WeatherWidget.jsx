import { useWeather } from '../hooks/useWeather'
import { describirClima } from '../services/weatherApi'
import Loading from './ui/Loading'
import ErrorState from './ui/ErrorState'

// Widget que consume la API pública Open-Meteo (clima de Viña del Mar).
export default function WeatherWidget() {
  const { clima, cargando, error } = useWeather()

  return (
    <div className="card-flat p-3 h-100">
      <div className="kicker mb-1">Clima del campus · Open-Meteo</div>
      {cargando && <Loading label="Consultando el clima…" />}
      {!cargando && error && <ErrorState message={error} />}
      {!cargando && !error && clima && <Cuerpo clima={clima} />}
    </div>
  )
}

function Cuerpo({ clima }) {
  const { texto, icono } = describirClima(clima.weathercode)
  const aptoExterior = clima.temperature > 12 && clima.weathercode <= 48

  return (
    <div className="d-flex align-items-center justify-content-between gap-3">
      <div>
        <div className="scoreboard-num" style={{ fontSize: '2.4rem', lineHeight: 1 }}>
          {Math.round(clima.temperature)}°C
        </div>
        <div className="text-steel" style={{ fontSize: '0.85rem' }}>
          {texto} · viento {Math.round(clima.windspeed)} km/h
        </div>
        <div
          className="mt-2"
          style={{ fontSize: '0.82rem', color: aptoExterior ? 'var(--court)' : 'var(--alert)' }}
        >
          {aptoExterior
            ? 'Clases al aire libre habilitadas.'
            : 'Priorizar infraestructura techada.'}
        </div>
      </div>
      <i className={`bi ${icono} `} style={{ fontSize: '2.6rem', color: 'var(--amber)' }}></i>
    </div>
  )
}
