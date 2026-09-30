import { useState, useEffect } from 'react';
import dataInicial from './data/iniciales.json';
import Socios from './pages/Socios';
// Importación del componente de la API del clima
import WeatherWidget from './components/WeatherWidget';

// Dashboard estructurado incluyendo el Widget de la API Pública
const DashboardSimulado = ({ socios }) => {
  // Cálculos rápidos para los KPIs basados en el estado global
  const totalSocios = socios.length;
  const sociosActivos = socios.filter(s => s.estado === 'Activa').length;
  const sociosVencidos = socios.filter(s => s.estado === 'Vencida').length;

  return (
    <div className="p-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">🏋️ Dashboard ClubTrack</h2>
          <p className="text-muted mb-0">Resumen operativo y control de accesos del club.</p>
        </div>
      </div>

      {/* Fila del Clima (API Pública) */}
      <div className="row mb-4">
        <div className="col-12 col-md-6 col-lg-4">
          <WeatherWidget />
        </div>
      </div>

      {/* Fila de Indicadores Clave (KPIs) de la Rúbrica */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-md-4">
          <div className="card border-0 shadow-sm bg-white p-3">
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-3">
                <i className="bi bi-people-fill fs-4"></i>
              </div>
              <div>
                <h6 className="text-muted mb-1 small text-uppercase">Total Socios</h6>
                <h3 className="fw-bold mb-0">{totalSocios}</h3>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-12 col-sm-6 col-md-4">
          <div className="card border-0 shadow-sm bg-white p-3">
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 bg-success bg-opacity-10 text-success rounded-3">
                <i className="bi bi-check-circle-fill fs-4"></i>
              </div>
              <div>
                <h6 className="text-muted mb-1 small text-uppercase">Membresías Activas</h6>
                <h3 className="fw-bold mb-0 text-success">{sociosActivos}</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-4">
          <div className="card border-0 shadow-sm bg-white p-3">
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 bg-danger bg-opacity-10 text-danger rounded-3">
                <i className="bi bi-exclamation-octagon-fill fs-4"></i>
              </div>
              <div>
                <h6 className="text-muted mb-1 small text-uppercase">Planes Vencidos</h6>
                <h3 className="fw-bold mb-0 text-danger">{sociosVencidos}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [socios, setSocios] = useState([]);
  const [vistaActual, setVistaActual] = useState('dashboard');

  // Inicialización estricta del estado local con Persistencia de datos en LocalStorage
  useEffect(() => {
    const datosGuardados = localStorage.getItem('clubtrack_socios');
    if (datosGuardados) {
      setSocios(JSON.parse(datosGuardados));
    } else {
      setSocios(dataInicial.socios);
      localStorage.setItem('clubtrack_socios', JSON.stringify(dataInicial.socios));
    }
  }, []);

  // Función global mutadora para agregar registros sin Backend
  const agregarSocio = (nuevoSocio) => {
    const listaActualizada = [...socios, { ...nuevoSocio, id: Date.now() }];
    setSocios(listaActualizada);
    localStorage.setItem('clubtrack_socios', JSON.stringify(listaActualizada));
  };

  return (
    <div className="container-fluid min-vh-100 p-0 d-flex flex-column flex-md-row">
      {/* Sidebar de navegación interactivo */}
      <nav className="bg-dark text-white p-3 flex-shrink-0 d-flex flex-column" style={{ minWidth: '260px' }}>
        <h4 className="text-primary fw-bold mb-4 px-2">
          <i className="bi bi-activity me-2"></i>ClubTrack
        </h4>
        <ul className="nav nav-pills flex-column mb-auto gap-1">
          <li className="nav-item">
            <button 
              className={`nav-link w-100 text-start d-flex align-items-center gap-2 py-2 px-3 border-0 rounded-2 transition-all ${vistaActual === 'dashboard' ? 'active bg-primary text-white' : 'bg-transparent text-white opacity-75'}`}
              onClick={() => setVistaActual('dashboard')}
            >
              <i className="bi bi-speedometer2"></i> Dashboard
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link w-100 text-start d-flex align-items-center gap-2 py-2 px-3 border-0 rounded-2 transition-all ${vistaActual === 'socios' ? 'active bg-primary text-white' : 'bg-transparent text-white opacity-75'}`}
              onClick={() => setVistaActual('socios')}
            >
              <i className="bi bi-people"></i> Módulo de Socios
            </button>
          </li>
        </ul>
        <div className="hr border-top border-secondary my-3 opacity-25"></div>
        <div className="px-2 small text-muted">
          <i className="bi bi-pc-display-horizontal me-1"></i> Taller Evaluado 2
        </div>
      </nav>

      {/* Contenedor dinámico de pantallas */}
      <main className="flex-grow-1 p-4 bg-light">
        {vistaActual === 'dashboard' && <DashboardSimulado socios={socios} />}
        {vistaActual === 'socios' && <Socios socios={socios} onAgregar={agregarSocio} />}
      </main>
    </div>
  );
}

export default App;
