// Integración con la API pública Open-Meteo (clima).
// API 100% gratuita, sin API key y con CORS habilitado.
// Documentación oficial: https://open-meteo.com/en/docs
//
// Coordenadas configuradas: Viña del Mar, Chile.
const LAT = '-33.0246'
const LON = '-71.5518'

const BASE_URL = 'https://api.open-meteo.com/v1/forecast'

// Devuelve { temperature, windspeed, weathercode, time } o lanza un Error.
export async function obtenerClimaLocal() {
  const params = new URLSearchParams({
    latitude: LAT,
    longitude: LON,
    current_weather: 'true',
    timezone: 'auto',
  })

  const response = await fetch(`${BASE_URL}?${params.toString()}`)

  if (!response.ok) {
    throw new Error(`Error al consultar Open-Meteo (HTTP ${response.status})`)
  }

  const data = await response.json()
  if (!data.current_weather) {
    throw new Error('La API no devolvió datos de clima actuales.')
  }

  const { temperature, windspeed, weathercode, time } = data.current_weather
  return { temperature, windspeed, weathercode, time }
}

// Traduce el weathercode de Open-Meteo a un texto e ícono legibles.
export function describirClima(code) {
  const tabla = [
    { max: 0, texto: 'Cielo despejado', icono: 'bi-sun-fill' },
    { max: 3, texto: 'Parcialmente nublado', icono: 'bi-cloud-sun-fill' },
    { max: 48, texto: 'Neblina', icono: 'bi-cloud-fog2-fill' },
    { max: 67, texto: 'Lluvia', icono: 'bi-cloud-rain-fill' },
    { max: 77, texto: 'Nieve', icono: 'bi-cloud-snow-fill' },
    { max: 82, texto: 'Chubascos', icono: 'bi-cloud-rain-heavy-fill' },
    { max: 99, texto: 'Tormenta eléctrica', icono: 'bi-cloud-lightning-rain-fill' },
  ]
  return tabla.find((f) => code <= f.max) ?? tabla[0]
}
