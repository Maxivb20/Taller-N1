import { useState, useEffect } from 'react';
import { obtenerClimaLocal } from '../services/weatherApi';

export default function WeatherWidget() {
  const [clima, setClima] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    obtenerClimaLocal()
      .then((datos) => {
        if (datos) {
          setClima(datos);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setCargando(false));
  }, []);

  // 1. Estado de Carga
  if (cargando) {
    return (
      <div className="alert alert-info d-flex align-middle align-items-center gap-2" role="alert">
        <div className="spinner-border spinner-border-sm text-info" role="status"></div>
        <span>Cargando estado del clima del campus...</span>
      </div>
    );
  }

  // 2. Estado de Error Funcional
  if (error || !clima) {
    return (
      <div className="alert alert-warning d-flex align-items-center gap-2" role="alert">
        <i className="bi bi-exclamation-triangle-fill fs-5"></i>
        <div>
          <strong>Aviso preventivo:</strong> No se pudo sincronizar el clima en tiempo real. Se recomienda coordinar actividades en gimnasio techado de forma preventiva.
        </div>
      </div>
    );
  }

  // 3. Estado de Éxito (Renderizado de KPI Condicional)
  const esAptoExterior = clima.temperature > 12;

  return (
    <div className={`card text-white shadow-sm mb-4 ${esAptoExterior ? 'bg-primary' : 'bg-dark'}`}>
      <div className="card-body d-flex align-items-center justify-between justify-content-between">
        <div>
          <h6 className="card-subtitle mb-1 text-white-50 text-uppercase tracking-wider small">
            <i className="bi bi-cloud-sun me-1"></i> Entorno Campus Viña
          </h6>
          <h3 className="card-title mb-0 fw-bold">{clima.temperature}°C</h3>
          <p className="card-text small mt-2 mb-0">
            {esAptoExterior 
              ? "🟢 Clases en canchas exteriores y running habilitadas." 
              : "⚠️ Alerta de baja temperatura: Priorizar uso de áreas e infraestructura techada."}
          </p>
        </div>
        <div className="fs-1 opacity-75">
          <i className={`bi ${esAptoExterior ? 'bi-sun-fill text-warning' : 'bi-snow text-info'}`}></i>
        </div>
      </div>
    </div>
  );
}
