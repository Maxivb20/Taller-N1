import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useClub } from '../context/ClubContext'
import { useToast } from '../context/ToastContext'
import { estadoMembresia, membresiaVigenteDe } from '../utils/business'
import { formatDate } from '../utils/dates'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import Modal from '../components/ui/Modal'
import EstadoBadge from '../components/ui/EstadoBadge'
import DataTable from '../components/ui/DataTable'

const ESTADOS = [
  { key: '', label: 'Todas' },
  { key: 'confirmada', label: 'Confirmadas' },
  { key: 'cancelada', label: 'Canceladas' },
]

export default function Inscripciones() {
  const { socios, actividades, membresias, inscripciones, acciones } = useClub()
  const { showToast } = useToast()

  const [filtroActividad, setFiltroActividad] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ socioId: '', actividadId: '', notas: '' })
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  const nombreSocio = (id) => socios.find((s) => s.id === id)?.nombre || id
  const actividadDe = (id) => actividades.find((a) => a.id === id)

  const cuposPorActividad = useMemo(() => {
    const mapa = {}
    actividades.forEach((a) => {
      const ocupados = inscripciones.filter(
        (i) => i.actividadId === a.id && i.estado === 'confirmada',
      ).length
      mapa[a.id] = { ocupados, cupo: a.cupo, disponibles: Math.max(0, a.cupo - ocupados) }
    })
    return mapa
  }, [actividades, inscripciones])

  const lista = useMemo(() => {
    return inscripciones.filter((i) => {
      const okAct = !filtroActividad || i.actividadId === filtroActividad
      const okEst = !filtroEstado || i.estado === filtroEstado
      return okAct && okEst
    })
  }, [inscripciones, filtroActividad, filtroEstado])

  const abrirNueva = () => {
    setForm({
      socioId: socios[0]?.id || '',
      actividadId: actividades[0]?.id || '',
      notas: '',
    })
    setError('')
    setModal(true)
  }

  const inscribir = async (e) => {
    e.preventDefault()
    if (!form.socioId || !form.actividadId) {
      setError('Selecciona un socio y una actividad.')
      return
    }
    setGuardando(true)
    setError('')
    try {
      await acciones.agregarInscripcion(form)
      showToast('Inscripción confirmada.')
      setModal(false)
    } catch (err) {
      setError(err.message || 'No fue posible registrar la inscripción.')
    } finally {
      setGuardando(false)
    }
  }

  const cambiarEstado = async (insc, nuevoEstado) => {
    try {
      await acciones.cambiarEstadoInscripcion(insc.id, nuevoEstado)
      showToast(`Inscripción marcada como ${nuevoEstado}.`)
    } catch (err) {
      showToast(err.message || 'Error al actualizar estado.', 'error')
    }
  }

  const eliminar = async (insc) => {
    if (!window.confirm('¿Eliminar este registro de inscripción y liberar el cupo?')) return
    try {
      await acciones.eliminarInscripcion(insc.id)
      showToast('Inscripción eliminada.', 'error')
    } catch (err) {
      showToast(err.message || 'Error al eliminar inscripción.', 'error')
    }
  }

  const totalConfirmadas = inscripciones.filter((i) => i.estado === 'confirmada').length
  const totalCapacidad = actividades.reduce((s, a) => s + a.cupo, 0) || 1
  const actSel = actividadDe(form.actividadId)
  const infoCupoSel = form.actividadId ? cuposPorActividad[form.actividadId] : null
  const memSocioSel = form.socioId ? membresiaVigenteDe(membresias, form.socioId) : null
  const estadoSocioSel = memSocioSel ? estadoMembresia(memSocioSel) : 'vencida'

  return (
    <>
      <PageHeader
        kicker="Club"
        title="Inscripciones y Cupos"
        subtitle="Inscripción de socios a actividades y control de capacidad disponible."
        actions={
          <button className="btn-solid" onClick={abrirNueva}>
            <i className="bi bi-journal-plus me-1"></i>Inscribir socio
          </button>
        }
      />

      <div className="row g-3 mb-3">
        <div className="col-sm-4">
          <StatCard
            label="Inscripciones confirmadas"
            value={totalConfirmadas}
            sub={`de ${totalCapacidad} cupos totales del club`}
            tone="court"
          />
        </div>
        <div className="col-sm-4">
          <StatCard
            label="Ocupación global"
            value={`${Math.round((totalConfirmadas / totalCapacidad) * 100)}%`}
            sub={`${actividades.length} actividades activas`}
            tone="amber"
          />
        </div>
        <div className="col-sm-4">
          <StatCard
            label="Canceladas / Históricas"
            value={inscripciones.filter((i) => i.estado === 'cancelada').length}
            sub="Cupos liberados"
            tone="steel"
          />
        </div>
      </div>

      <div className="d-flex gap-2 flex-wrap align-items-center mb-3">
        <select
          className="form-select"
          style={{ maxWidth: 260 }}
          value={filtroActividad}
          onChange={(e) => setFiltroActividad(e.target.value)}
        >
          <option value="">Todas las actividades</option>
          {actividades.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre} ({cuposPorActividad[a.id]?.ocupados || 0}/{a.cupo})
            </option>
          ))}
        </select>

        {ESTADOS.map((t) => (
          <button
            key={t.key}
            className={`btn-outline-club ${filtroEstado === t.key ? 'border-success text-court' : ''}`}
            onClick={() => setFiltroEstado(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="card-flat p-3">
        <DataTable
          columns={[
            { key: 'socio', label: 'Socio' },
            { key: 'actividad', label: 'Actividad' },
            { key: 'horario', label: 'Horario / Ubicación' },
            { key: 'fecha', label: 'Fecha inscripción' },
            { key: 'estado', label: 'Estado' },
            { key: 'notas', label: 'Notas' },
            { key: 'acc', label: '', className: 'text-end' },
          ]}
          isEmpty={lista.length === 0}
          emptyIcon="bi-journal-x"
          emptyText="No hay inscripciones para el filtro seleccionado."
        >
          {lista.map((i) => {
            const act = actividadDe(i.actividadId)
            return (
              <tr key={i.id}>
                <td>
                  <Link
                    to={`/socios/${i.socioId}`}
                    style={{ color: 'var(--court-dark)', fontWeight: 600 }}
                  >
                    {nombreSocio(i.socioId)}
                  </Link>
                </td>
                <td className="fw-semibold">{act?.nombre || i.actividadId}</td>
                <td className="text-steel" style={{ fontSize: '0.82rem' }}>
                  {act ? `${act.horario} · ${act.ubicacion}` : '—'}
                </td>
                <td>{formatDate(i.fechaInscripcion)}</td>
                <td>
                  <EstadoBadge estado={i.estado} />
                </td>
                <td className="text-steel" style={{ fontSize: '0.82rem' }}>
                  {i.notas || '—'}
                </td>
                <td className="text-end">
                  <div className="d-inline-flex gap-1">
                    {i.estado === 'confirmada' ? (
                      <button
                        className="btn-ghost-sm text-alert"
                        title="Cancelar inscripción (liberar cupo)"
                        onClick={() => cambiarEstado(i, 'cancelada')}
                      >
                        <i className="bi bi-x-circle"></i>
                      </button>
                    ) : (
                      <button
                        className="btn-ghost-sm text-court"
                        title="Reactivar inscripción"
                        onClick={() => cambiarEstado(i, 'confirmada')}
                      >
                        <i className="bi bi-check-circle"></i>
                      </button>
                    )}
                    <button
                      className="btn-ghost-sm text-alert"
                      title="Eliminar registro"
                      onClick={() => eliminar(i)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </DataTable>
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Nueva inscripción a actividad"
        footer={
          <>
            <button className="btn-outline-club" onClick={() => setModal(false)}>
              Cancelar
            </button>
            <button className="btn-solid" type="submit" form="form-inscripcion" disabled={guardando}>
              {guardando ? 'Validando…' : 'Confirmar inscripción'}
            </button>
          </>
        }
      >
        <form id="form-inscripcion" onSubmit={inscribir}>
          {error && <div className="scan-result fail mb-3">{error}</div>}
          <div className="mb-3">
            <label className="form-label small fw-semibold text-steel">Socio</label>
            <select
              className="form-select"
              value={form.socioId}
              onChange={(e) => setForm({ ...form, socioId: e.target.value })}
            >
              {socios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} ({s.id})
                </option>
              ))}
            </select>
            {form.socioId && (
              <div className="mt-1 small">
                Estado de membresía:{' '}
                <EstadoBadge estado={estadoSocioSel} />
              </div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-steel">Actividad / Evento</label>
            <select
              className="form-select"
              value={form.actividadId}
              onChange={(e) => setForm({ ...form, actividadId: e.target.value })}
            >
              {actividades.map((a) => {
                const c = cuposPorActividad[a.id]
                return (
                  <option key={a.id} value={a.id}>
                    {a.nombre} — Cupo: {c?.ocupados || 0}/{a.cupo}
                  </option>
                )
              })}
            </select>
          </div>

          {actSel && infoCupoSel && (
            <div
              className={`scan-result ${infoCupoSel.disponibles > 0 ? 'ok' : 'fail'} mb-3`}
              style={{ fontSize: '0.84rem' }}
            >
              <strong>{actSel.nombre}</strong> ({actSel.horario} · {actSel.ubicacion})
              <br />
              Disponibilidad: <strong>{infoCupoSel.disponibles}</strong> plaza(s) libre(s) de{' '}
              {actSel.cupo}.
            </div>
          )}

          <div className="mb-1">
            <label className="form-label small fw-semibold text-steel">Observaciones (opcional)</label>
            <input
              className="form-control"
              placeholder="Ej: Requiere bicicleta talla M / Mat propio"
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </>
  )
}
