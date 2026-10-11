import { NavLink, Outlet } from 'react-router-dom'

const secciones = [
  {
    label: 'Principal',
    items: [
      { to: '/', icon: 'bi-speedometer2', text: 'Dashboard', end: true },
      { to: '/qr', icon: 'bi-qr-code', text: 'Check-in QR' },
    ],
  },
  {
    label: 'Club',
    items: [
      { to: '/socios', icon: 'bi-people', text: 'Socios' },
      { to: '/planes', icon: 'bi-card-list', text: 'Planes' },
      { to: '/membresias', icon: 'bi-patch-check', text: 'Membresías' },
      { to: '/actividades', icon: 'bi-calendar-week', text: 'Actividades' },
    ],
  },
  {
    label: 'Control',
    items: [
      { to: '/asistencia', icon: 'bi-clipboard-check', text: 'Asistencia' },
      { to: '/pagos', icon: 'bi-cash-coin', text: 'Pagos' },
      { to: '/vencimientos', icon: 'bi-exclamation-triangle', text: 'Vencimientos' },
    ],
  },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="mark">CT</span>
        <span className="name">ClubTrack</span>
        <span className="sub">Gestión de membresías y asistencia</span>
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
        ClubTrack v1.0
        <br />
        Taller Evaluado 2 · React
      </div>
    </aside>
  )
}
