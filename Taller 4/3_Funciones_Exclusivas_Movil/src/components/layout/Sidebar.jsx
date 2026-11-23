import { NavLink } from 'react-router-dom'
import { vibrateTap } from '../../services/mobileNative'

const secciones = [
  {
    label: 'Principal',
    items: [
      { to: '/', icon: 'bi-speedometer2', text: 'Dashboard', end: true },
      { to: '/qr', icon: 'bi-camera-fill', text: 'Escáner QR Móvil' },
    ],
  },
  {
    label: 'Club',
    items: [
      { to: '/socios', icon: 'bi-people', text: 'Socios' },
      { to: '/planes', icon: 'bi-card-list', text: 'Planes' },
      { to: '/membresias', icon: 'bi-patch-check', text: 'Membresías' },
      { to: '/actividades', icon: 'bi-calendar-week', text: 'Actividades' },
      { to: '/instructores', icon: 'bi-person-badge', text: 'Instructores' },
      { to: '/inscripciones', icon: 'bi-journal-check', text: 'Inscripciones' },
    ],
  },
  {
    label: 'Control',
    items: [
      { to: '/asistencia', icon: 'bi-clipboard-check', text: 'Asistencia' },
      { to: '/pagos', icon: 'bi-cash-coin', text: 'Pagos' },
      { to: '/vencimientos', icon: 'bi-exclamation-triangle', text: 'Vencimientos' },
      { to: '/bitacora', icon: 'bi-clock-history', text: 'Bitácora' },
    ],
  },
]

const bottomItems = [
  { to: '/', icon: 'bi-speedometer2', text: 'Inicio', end: true },
  { to: '/qr', icon: 'bi-qr-code-scan', text: 'Cámara QR' },
  { to: '/socios', icon: 'bi-people', text: 'Socios' },
  { to: '/pagos', icon: 'bi-cash-coin', text: 'Pagos' },
  { to: '/bitacora', icon: 'bi-clock-history', text: 'Bitácora' },
]

export default function Sidebar() {
  return (
    <>
      <aside className="sidebar">
        <div className="brand">
          <span className="mark">CT</span>
          <span className="name">ClubTrack</span>
          <span className="sub">App Móvil Android &amp; Full Stack</span>
        </div>
        <nav>
          {secciones.map((sec) => (
            <div key={sec.label}>
              <div className="nav-section-label">{sec.label.toUpperCase()}</div>
              {sec.items.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={it.end}
                  onClick={() => vibrateTap()}
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                >
                  <i className={`bi ${it.icon}`}></i>
                  {it.text}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="foot">
          ClubTrack v4.0 · Android APK
          <br />
          Hito 4 · Web &amp; Móvil
        </div>
      </aside>

      <nav className="mobile-bottom-nav" aria-label="Navegación móvil">
        {bottomItems.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end}
            onClick={() => vibrateTap()}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            <i className={`bi ${it.icon}`}></i>
            <span>{it.text}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
