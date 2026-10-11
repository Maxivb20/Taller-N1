import { useMemo, useState } from 'react'
import { useClub } from '../context/ClubContext'
import { useToast } from '../context/ToastContext'
import { diasRestantes, estadoMembresia } from '../utils/business'
import { addDays, formatDate, today } from '../utils/dates'
import { formatMoney } from '../utils/format'
import PageHeader from '../components/ui/PageHeader'
import Modal from '../components/ui/Modal'
import EstadoBadge from '../components/ui/EstadoBadge'
import DataTable from '../components/ui/DataTable'

const TABS = [
  { key: '', label: 'Todas' },
  { key: 'activa', label: 'Activas' },
  { key: 'por_vencer', label: 'Por vencer' },
  { key: 'vencida', label: 'Vencidas' },
]

export default function Membresias() {
  const { socios, planes, actividades, membresias, acciones } = useClub()
  const { showToast } = useToast()
  const [filtro, setFiltro] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ socioId: '', planId: '', inicio: today(), actividadPreferida: '' })

  const nombreSocio = (id) => socios.find((s) => s.id === id)?.nombre || id
  const planDe = (id) => planes.find((p) => p.id === id)

  const lista = useMemo(() => {
    const base = [...membresias].sort((a, b) => new Date(a.fechaFin) - new Date(b.fechaFin))
    return filtro ? base.filter((m) => estadoMembresia(m) === filtro) : base
  }, [membresias, filtro])

  const planSeleccionado = planDe(form.planId)
  const preview =
    planSeleccionado && form.inicio
      ? `Vigencia: ${formatDate(form.inicio)} → ${formatDate(
          addDays(form.inicio, planSeleccionado.duracionDias),
        )} (${planSeleccionado.duracionDias} días). Se generará un pago pendiente por ${formatMoney(
          planSeleccionado.precio,
        )}.`
      : 'Selecciona un plan y una fecha de inicio.'

  const abrirNueva = () => {
    setForm({
      socioId: socios[0]?.id || '',
      planId: planes[0]?.id || '',
      inicio: today(),
      actividadPreferida: '',
    })
    setModal(true)
  }

  const registrar = (e) => {
    e.preventDefault()
    const plan = planDe(form.planId)
    if (!form.socioId || !plan) {
      showToast('Debes seleccionar socio y plan.', 'error')
      return
    }
    acciones.agregarMembresia({
      socioId: form.socioId,
      planId: form.planId,
      inicio: form.inicio,
      actividadPreferida: form.actividadPreferida || null,
      plan,
    })
    showToast('Membresía registrada. Se generó un pago pendiente.')
    setModal(false)
  }

  const renovar = (mem) => {
    const plan = planDe(mem.planId)
    if (!plan) return
    if (!window.confirm(`¿Renovar la membresía de ${nombreSocio(mem.socioId)} por ${plan.duracionDias} días más?`))
      return
    acciones.renovarMembresia(mem, plan)
    showToast('Membresía renovada correctamente.')
  }

  return (
    <>
      <PageHeader
        kicker="Club"
        title="Membresías"
        subtitle="Control de vigencia, renovación y alta de membresías."
        actions={
          <button className="btn-solid" onClick={abrirNueva}>
            <i className="bi bi-plus-lg me-1"></i>Nueva membresía
          </button>
        }
      />

      <div className="d-flex gap-2 mb-3 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`btn-outline-club ${filtro === t.key ? 'border-success text-court' : ''}`}
            onClick={() => setFiltro(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="card-flat p-3">
        <DataTable
          columns={[
            { key: 'socio', label: 'Socio' },
            { key: 'plan', label: 'Plan' },
            { key: 'inicio', label: 'Inicio' },
            { key: 'fin', label: 'Vence' },
            { key: 'restantes', label: 'Restantes' },
            { key: 'estado', label: 'Estado' },
            { key: 'acc', label: '', className: 'text-end' },
          ]}
          isEmpty={lista.length === 0}
          emptyIcon="bi-patch-check"
          emptyText="No hay membresías para este filtro."
        >
          {lista.map((m) => {
            const restantes = diasRestantes(m)
            return (
              <tr key={m.id}>
                <td>{nombreSocio(m.socioId)}</td>
                <td>{planDe(m.planId)?.nombre || m.planId}</td>
                <td>{formatDate(m.fechaInicio)}</td>
                <td>{formatDate(m.fechaFin)}</td>
                <td>
                  {restantes >= 0 ? (
                    `${restantes} día(s)`
                  ) : (
                    <span className="text-alert">{Math.abs(restantes)} día(s) vencida</span>
                  )}
                </td>
                <td>
                  <EstadoBadge estado={estadoMembresia(m)} />
                </td>
                <td className="text-end">
                  <button
                    className="btn-ghost-sm"
                    title="Renovar"
                    onClick={() => renovar(m)}
                  >
                    <i className="bi bi-arrow-repeat"></i>
                  </button>
                </td>
              </tr>
            )
          })}
        </DataTable>
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Nueva membresía"
        footer={
          <>
            <button className="btn-outline-club" onClick={() => setModal(false)}>
              Cancelar
            </button>
            <button className="btn-solid" type="submit" form="form-membresia">
              Registrar
            </button>
          </>
        }
      >
        <form id="form-membresia" onSubmit={registrar}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-steel">Socio</label>
            <select
              className="form-select"
              value={form.socioId}
              onChange={(e) => setForm({ ...form, socioId: e.target.value })}
            >
              <option value="">Selecciona un socio</option>
              {socios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-steel">Plan</label>
            <select
              className="form-select"
              value={form.planId}
              onChange={(e) => setForm({ ...form, planId: e.target.value })}
            >
              <option value="">Selecciona un plan</option>
              {planes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} — {formatMoney(p.precio)}
                </option>
              ))}
            </select>
          </div>
          <div className="row">
            <div className="col-6 mb-3">
              <label className="form-label small fw-semibold text-steel">Inicio</label>
              <input
                type="date"
                className="form-control"
                value={form.inicio}
                onChange={(e) => setForm({ ...form, inicio: e.target.value })}
              />
            </div>
            <div className="col-6 mb-3">
              <label className="form-label small fw-semibold text-steel">Actividad preferida</label>
              <select
                className="form-select"
                value={form.actividadPreferida}
                onChange={(e) => setForm({ ...form, actividadPreferida: e.target.value })}
              >
                <option value="">Sin preferencia</option>
                {actividades.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="scan-result ok" style={{ fontSize: '0.84rem' }}>
            {preview}
          </div>
        </form>
      </Modal>
    </>
  )
}
