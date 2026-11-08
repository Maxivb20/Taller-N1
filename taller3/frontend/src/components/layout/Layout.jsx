import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useClub } from '../../context/ClubContext'
import Loading from '../ui/Loading'
import ErrorState from '../ui/ErrorState'

export default function Layout() {
  const { cargando, error, socios, acciones } = useClub()

  // Mostrar estado de carga o error de conexión cuando aún no se han cargado datos iniciales
  const sinDatosIniciales = socios.length === 0 && (cargando || error)

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">
        {sinDatosIniciales && cargando && (
          <div className="card-flat p-4">
            <Loading label="Cargando datos del club…" />
          </div>
        )}
        {sinDatosIniciales && !cargando && error && (
          <div className="card-flat p-4">
            <h3 className="mb-2">No se pudo conectar con el servidor</h3>
            <p className="text-steel mb-3" style={{ fontSize: '0.9rem' }}>
              Revisa que el backend y las bases de datos estén corriendo.
            </p>
            <ErrorState message={error} onRetry={() => acciones.recargar().catch(() => {})} />
          </div>
        )}
        {!sinDatosIniciales && <Outlet />}
      </main>
    </div>
  )
}
