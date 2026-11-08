import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useClub } from '../context/ClubContext'
import { useToast } from '../context/ToastContext'
import { diasRestantes, estadoMembresia, membresiaVigenteDe } from '../utils/business'
import { formatDate } from '../utils/dates'
import { formatMoney } from '../utils/format'
import PageHeader from '../components/ui/PageHeader'
import EstadoBadge from '../components/ui/EstadoBadge'
import DataTable from '../components/ui/DataTable'
import EmptyState from '../components/ui/EmptyState'

export default function SocioHistorial() {
  const { id } = useParams()
  const { socios, planes, actividades, membresias, inscripciones, pagos, accessLogs, acciones } = useClub()
  const { showToast } = useToast()

  const socio = socios.find((s) => s.id === id)

  const planDe = (planId) => planes.find((p) => p.id === planId)
  const actividadDe = (actId) => actividades.find((a) => a.id === actId)

  const memsSocio = useMemo(
    () =>
      membresias
        .filter((m) => m.socioId === id)
        .sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio)),
    [membresias, id],
  )

  const inscSocio = useMemo(
    () =>
      inscripciones
        .filter((i) => i.socioId === id)
        .sort((a, b) => b.fechaInscripcion.localeCompare(a.fechaInscripcion)),
    [inscripciones, id],
  )

  const pagosSocio = useMemo(
    () => pagos.filter((p) => p.socioId === id).sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [pagos, id],
  )

  const logsSocio = useMemo(
    () =>
      accessLogs
        .filter((a) => a.socioId === id)
        .sort((a, b) => (b.fecha + b.hora).localeCompare(a.fecha + a.hora)),
    [accessLogs, id],
  )

  if (!socio) {
    return (
      <>
        <PageHeader kicker="Club" title="Historial del socio" />
        <div className="card-flat p-3">
          <EmptyState icon="bi-person-x">
            <strong>Socio no encontrado.</strong>
            <div className="mt-2">
              <Link to="/socios" className="btn-outline-club">
                <i className="bi bi-arrow-left me-1"></i>Volver a socios
              </Link>
            </div>
          </EmptyState>
        </div>
      </>
    )
  }

  const mem = membresiaVigenteDe(membresias, socio.id)
  const estado = mem ? estadoMembresia(mem) : 'vencida'
  const pagado = pagosSocio.filter((p) => p.estado === 'pagado').reduce((s, p) => s + p.monto, 0)
  const pendiente = pagosSocio.filter((p) => p.estado === 'pendiente').reduce((s, p) => s + p.monto, 0)

  const marcarPagado = async (pago) => {
    try {
      await acciones.marcarPagado(pago.id)
      showToast('Pago marcado como pagado.')
    } catch (err) {
      showToast(err.message || 'Error al confirmar pago.', 'error')
    }
  }

  return (
    <>
      <PageHeader
        kicker="Club"
        title={socio.nombre}
        subtitle="Ficha e historial completo del socio."
        actions={
          <Link to="/socios" className="btn-outline-club">
            <i className="bi bi-arrow-left me-1"></i>Volver a socios
          </Link>
        }
      />

      <div className="row g-3 mb-3">
        <div className="col-lg-8">
          <div className="card-flat p-3 h-100">
            <h3 className="mb-3">Datos de contacto</h3>
            <div className="row" style={{ fontSize: '0.9rem' }}>
              <div className="col-sm-6 mb-2">
                <div className="text-steel" style={{ fontSize: '0.78rem' }}>
                  Correo
                </div>
                {socio.email}
              </div>
              <div className="col-sm-6 mb-2">
                <div className="text-steel" style={{ fontSize: '0.78rem' }}>
                  Teléfono
                </div>
                {socio.telefono}
              </div>
              <div className="col-sm-6">
                <div className="text-steel" style={{ fontSize: '0.78rem' }}>
                  Socio desde
                </div>
                {formatDate(socio.fechaIngreso)}
              </div>
              <div className="col-sm-6">
                <div className="text-steel" style={{ fontSize: '0.78rem' }}>
                  Estado actual
                </div>
                <EstadoBadge estado={estado} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card-flat p-3 h-100">
            <h3 className="mb-3">Membresía vigente</h3>
            {mem ? (
              <div style={{ fontSize: '0.9rem' }}>
                <div className="mb-1">
                  <span className="text-steel">Plan: </span>
                  {planDe(mem.planId)?.nombre || '—'}
                </div>
                <div className="mb-1">
                  <span className="text-steel">Inicio: </span>
                  {formatDate(mem.fechaInicio)}
                </div>
                <div className="mb-1">
                  <span className="text-steel">Vence: </span>
                  {formatDate(mem.fechaFin)}
                </div>
                <div className="mb-3">
                  <span className="text-steel">Días restantes: </span>
                  {diasRestantes(mem) >= 0 ? diasRestantes(mem) : 0}
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-steel">Pagado</span>
                  <span className="fw-semibold text-court">{formatMoney(pagado)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-steel">Pendiente</span>
                  <span className="fw-semibold text-alert">{formatMoney(pendiente)}</span>
                </div>
              </div>
            ) : (
              <div className="text-steel">Sin membresías registradas.</div>
            )}
          </div>
        </div>
      </div>

      <div className="card-flat p-3 mb-3">
        <h3 className="mb-3">Membresías</h3>
        <DataTable
          columns={[
            { key: 'plan', label: 'Plan' },
            { key: 'inicio', label: 'Inicio' },
            { key: 'fin', label: 'Vence' },
            { key: 'estado', label: 'Estado' },
          ]}
          isEmpty={memsSocio.length === 0}
          emptyIcon="bi-patch-check"
          emptyText="Sin membresías."
        >
          {memsSocio.map((m) => (
            <tr key={m.id}>
              <td>{planDe(m.planId)?.nombre || '—'}</td>
              <td>{formatDate(m.fechaInicio)}</td>
              <td>{formatDate(m.fechaFin)}</td>
              <td>
                <EstadoBadge estado={estadoMembresia(m)} />
              </td>
            </tr>
          ))}
        </DataTable>
      </div>

      <div className="card-flat p-3 mb-3">
        <h3 className="mb-3">Inscripciones a actividades</h3>
        <DataTable
          columns={[
            { key: 'actividad', label: 'Actividad' },
            { key: 'fecha', label: 'Fecha inscripción' },
            { key: 'estado', label: 'Estado' },
            { key: 'notas', label: 'Notas' },
          ]}
          isEmpty={inscSocio.length === 0}
          emptyIcon="bi-journal-check"
          emptyText="Sin inscripciones registradas."
        >
          {inscSocio.map((i) => (
            <tr key={i.id}>
              <td>{actividadDe(i.actividadId)?.nombre || i.actividadId}</td>
              <td>{formatDate(i.fechaInscripcion)}</td>
              <td>
                <EstadoBadge estado={i.estado} />
              </td>
              <td>{i.notas || '—'}</td>
            </tr>
          ))}
        </DataTable>
      </div>

      <div className="card-flat p-3 mb-3">
        <h3 className="mb-3">Pagos</h3>
        <DataTable
          columns={[
            { key: 'comprobante', label: 'Comprobante' },
            { key: 'fecha', label: 'Fecha' },
            { key: 'monto', label: 'Monto' },
            { key: 'metodo', label: 'Método' },
            { key: 'estado', label: 'Estado' },
            { key: 'acc', label: '', className: 'text-end' },
          ]}
          isEmpty={pagosSocio.length === 0}
          emptyIcon="bi-cash-stack"
          emptyText="Sin pagos registrados."
        >
          {pagosSocio.map((p) => (
            <tr key={p.id}>
              <td>
                <code className="text-steel">{p.comprobante || p.id}</code>
              </td>
              <td>{formatDate(p.fecha)}</td>
              <td className="fw-semibold">{formatMoney(p.monto)}</td>
              <td>{p.metodo}</td>
              <td>
                <EstadoBadge estado={p.estado} />
              </td>
              <td className="text-end">
                {p.estado === 'pendiente' ? (
                  <button className="btn-solid" onClick={() => marcarPagado(p)}>
                    Marcar pagado
                  </button>
                ) : (
                  <i className="bi bi-check2-circle text-court"></i>
                )}
              </td>
            </tr>
          ))}
        </DataTable>
      </div>

      <div className="card-flat p-3">
        <h3 className="mb-3">Asistencia e intentos de acceso</h3>
        <DataTable
          columns={[
            { key: 'fecha', label: 'Fecha' },
            { key: 'hora', label: 'Hora' },
            { key: 'actividad', label: 'Actividad' },
            { key: 'metodo', label: 'Método' },
            { key: 'estado', label: 'Resultado' },
            { key: 'motivo', label: 'Detalle' },
          ]}
          isEmpty={logsSocio.length === 0}
          emptyIcon="bi-clipboard-x"
          emptyText="Sin registros de acceso en MongoDB."
        >
          {logsSocio.map((a) => (
            <tr key={a.id}>
              <td>{formatDate(a.fecha)}</td>
              <td>{a.hora}</td>
              <td>{a.actividadNombre || actividadDe(a.actividadId)?.nombre || '—'}</td>
              <td>{a.metodo}</td>
              <td>
                <EstadoBadge estado={a.autorizado ? 'autorizado' : 'denegado'} />
              </td>
              <td style={{ fontSize: '0.84rem' }}>{a.motivo}</td>
            </tr>
          ))}
        </DataTable>
      </div>
    </>
  )
}
