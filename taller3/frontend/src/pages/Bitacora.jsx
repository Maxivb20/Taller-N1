import { useMemo, useState } from 'react'
import { useClub } from '../context/ClubContext'
import { useToast } from '../context/ToastContext'
import { formatDate } from '../utils/dates'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import DataTable from '../components/ui/DataTable'
import EstadoBadge from '../components/ui/EstadoBadge'

const MODULOS = [
  { key: '', label: 'Todos' },
  { key: 'asistencia', label: 'Accesos / QR' },
  { key: 'socios', label: 'Socios' },
  { key: 'membresias', label: 'Membresías' },
  { key: 'inscripciones', label: 'Inscripciones' },
  { key: 'pagos', label: 'Pagos' },
]

export default function Bitacora() {
  const { bitacora, accessLogs } = useClub()
  const { showToast } = useToast()
  const [modulo, setModulo] = useState('')
  const [vista, setVista] = useState('eventos') // 'eventos' | 'accesos'
  const [docSeleccionado, setDocSeleccionado] = useState(null)

  const eventosFiltrados = useMemo(() => {
    return modulo ? bitacora.filter((e) => e.modulo === modulo) : bitacora
  }, [bitacora, modulo])

  const rechazos = useMemo(() => accessLogs.filter((l) => !l.autorizado).length, [accessLogs])

  const copiarJson = (obj) => {
    navigator.clipboard?.writeText(JSON.stringify(obj, null, 2))
    showToast('Documento JSON copiado al portapapeles.')
  }

  return (
    <>
      <PageHeader
        kicker="Control"
        title="Bitácora de actividad"
        subtitle="Historial de eventos operacionales y registros de acceso del club."
      />

      <div className="row g-3 mb-3">
        <div className="col-sm-4">
          <StatCard
            label="Eventos registrados"
            value={bitacora.length}
            sub="Altas, pagos, inscripciones y accesos"
            tone="court"
          />
        </div>
        <div className="col-sm-4">
          <StatCard
            label="Registros de acceso"
            value={accessLogs.length}
            sub="Ingresos por QR y recepción"
            tone="amber"
          />
        </div>
        <div className="col-sm-4">
          <StatCard
            label="Accesos rechazados"
            value={rechazos}
            sub="Por membresía vencida"
            tone="alert"
          />
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div className="d-flex gap-2 flex-wrap">
          <button
            className={`btn-outline-club ${vista === 'eventos' ? 'border-success text-court' : ''}`}
            onClick={() => setVista('eventos')}
          >
            <i className="bi bi-journal-code me-1"></i>Eventos del sistema ({bitacora.length})
          </button>
          <button
            className={`btn-outline-club ${vista === 'accesos' ? 'border-success text-court' : ''}`}
            onClick={() => setVista('accesos')}
          >
            <i className="bi bi-qr-code-scan me-1"></i>Historial de accesos ({accessLogs.length})
          </button>
        </div>

        {vista === 'eventos' && (
          <div className="d-flex gap-1 flex-wrap">
            {MODULOS.map((m) => (
              <button
                key={m.key}
                className={`btn-outline-club ${modulo === m.key ? 'border-success text-court' : ''}`}
                onClick={() => setModulo(m.key)}
              >
                {m.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="row g-3">
        <div className={docSeleccionado ? 'col-lg-8' : 'col-12'}>
          <div className="card-flat p-3">
            {vista === 'eventos' ? (
              <DataTable
                columns={[
                  { key: 'fecha', label: 'Fecha / Hora' },
                  { key: 'tipo', label: 'Evento' },
                  { key: 'modulo', label: 'Módulo' },
                  { key: 'desc', label: 'Descripción' },
                  { key: 'acc', label: 'JSON', className: 'text-end' },
                ]}
                isEmpty={eventosFiltrados.length === 0}
                emptyIcon="bi-database-x"
                emptyText="No hay eventos en MongoDB para este filtro."
              >
                {eventosFiltrados.map((ev) => (
                  <tr key={ev.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {formatDate(ev.fecha)} · <span className="text-steel">{ev.hora}</span>
                    </td>
                    <td>
                      <code className="text-court fw-semibold">{ev.tipo}</code>
                    </td>
                    <td className="text-uppercase small text-steel fw-semibold">{ev.modulo}</td>
                    <td>{ev.descripcion}</td>
                    <td className="text-end">
                      <button
                        className="btn-ghost-sm"
                        title="Inspeccionar documento BSON/JSON"
                        onClick={() => setDocSeleccionado(ev)}
                      >
                        <i className="bi bi-braces"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </DataTable>
            ) : (
              <DataTable
                columns={[
                  { key: 'fecha', label: 'Fecha / Hora' },
                  { key: 'socio', label: 'Socio' },
                  { key: 'actividad', label: 'Actividad / Punto' },
                  { key: 'metodo', label: 'Método' },
                  { key: 'resultado', label: 'Resultado' },
                  { key: 'motivo', label: 'Detalle' },
                  { key: 'acc', label: 'JSON', className: 'text-end' },
                ]}
                isEmpty={accessLogs.length === 0}
                emptyIcon="bi-database-x"
                emptyText="No hay registros de acceso en MongoDB."
              >
                {accessLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {formatDate(log.fecha)} · <span className="text-steel">{log.hora}</span>
                    </td>
                    <td className="fw-semibold">{log.socioNombre}</td>
                    <td>
                      {log.actividadNombre}
                      <div className="text-steel" style={{ fontSize: '0.75rem' }}>
                        {log.metadata?.dispositivo} · {log.metadata?.ubicacion}
                      </div>
                    </td>
                    <td>{log.metodo}</td>
                    <td>
                      <EstadoBadge estado={log.autorizado ? 'autorizado' : 'denegado'} />
                    </td>
                    <td style={{ fontSize: '0.84rem' }}>{log.motivo}</td>
                    <td className="text-end">
                      <button
                        className="btn-ghost-sm"
                        title="Inspeccionar documento BSON/JSON"
                        onClick={() => setDocSeleccionado(log)}
                      >
                        <i className="bi bi-braces"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </DataTable>
            )}
          </div>
        </div>

        {docSeleccionado && (
          <div className="col-lg-4">
            <div className="card-flat p-3 position-sticky" style={{ top: 20 }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h3 className="mb-0">Documento MongoDB</h3>
                <div className="d-flex gap-1">
                  <button
                    className="btn-ghost-sm"
                    title="Copiar JSON"
                    onClick={() => copiarJson(docSeleccionado)}
                  >
                    <i className="bi bi-clipboard"></i>
                  </button>
                  <button
                    className="btn-ghost-sm"
                    title="Cerrar"
                    onClick={() => setDocSeleccionado(null)}
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>
              </div>
              <p className="text-steel mb-2" style={{ fontSize: '0.8rem' }}>
                Estructura documental sin esquema rígido (<code>payload</code> / <code>metadata</code> anidados):
              </p>
              <pre
                className="p-2 rounded mb-0"
                style={{
                  background: '#14181c',
                  color: '#f4f1ea',
                  fontSize: '0.76rem',
                  maxHeight: 380,
                  overflow: 'auto',
                }}
              >
                {JSON.stringify(docSeleccionado, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
