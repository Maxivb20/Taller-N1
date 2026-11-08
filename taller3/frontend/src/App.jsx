import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Socios from './pages/Socios'
import SocioHistorial from './pages/SocioHistorial'
import Planes from './pages/Planes'
import Membresias from './pages/Membresias'
import Actividades from './pages/Actividades'
import Instructores from './pages/Instructores'
import Inscripciones from './pages/Inscripciones'
import Asistencia from './pages/Asistencia'
import CheckinQR from './pages/CheckinQR'
import Pagos from './pages/Pagos'
import Vencimientos from './pages/Vencimientos'
import Bitacora from './pages/Bitacora'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/socios" element={<Socios />} />
        <Route path="/socios/:id" element={<SocioHistorial />} />
        <Route path="/planes" element={<Planes />} />
        <Route path="/membresias" element={<Membresias />} />
        <Route path="/actividades" element={<Actividades />} />
        <Route path="/instructores" element={<Instructores />} />
        <Route path="/inscripciones" element={<Inscripciones />} />
        <Route path="/asistencia" element={<Asistencia />} />
        <Route path="/qr" element={<CheckinQR />} />
        <Route path="/pagos" element={<Pagos />} />
        <Route path="/vencimientos" element={<Vencimientos />} />
        <Route path="/bitacora" element={<Bitacora />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
