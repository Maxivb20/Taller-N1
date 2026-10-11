import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useClub } from '../context/ClubContext'
import { useToast } from '../context/ToastContext'
import { formatDate } from '../utils/dates'
import { formatMoney } from '../utils/format'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import Modal from '../components/ui/Modal'
import EstadoBadge from '../components/ui/EstadoBadge'
import DataTable from '../components/ui/DataTable'

const TABS = [
  { key: '', label: 'Todos' },
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'pagado', label: 'Pagados' },
]

const METODOS = ['Efectivo', 'Débito', 'Crédito', 'Transferencia']

export default function Pagos() {
  const { socios, planes, membresias, pagos, acciones } = useClub()
  const { showToast } = useToast()

  const [filtro, setFiltro] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ socioId: '', membresiaId: '', monto: '', metodo: 'Efectivo' })
  const [error, setError] = useState('')

  const nombreSocio = (id) => socios.find((s) => s.id === id)?.nombre || id
  const planDe = (id) => planes.find((p) => p.id === id)

  const stats = useMemo(() => {
    const recaudado = pagos.filter((p) => p.estado === 'pagado').reduce((s, p) => s + p.monto, 0)
    const pendiente = pagos.filter((p) => p.estado === 'pendiente')
    return {
      recaudado,
      pendienteMonto: pendiente.reduce((s, p) => s + p.monto, 0),
      pendienteN: pendiente.length,
      total: pagos.length,
    }
  }, [pagos])

  const lista = useMemo(() => {
    const base = [...pagos].sort((a, b) => b.fecha.localeCompare(a.fecha))
    return filtro ? base.filter((p) => p.estado === filtro) : base
  }, [pagos, filtro])

  const membresiasDelSocio = (socioId) => membresias.filter((m) => m.socioId === socioId)

  const abrirNuevo = () => {
    const socioInicial = socios[0]
    const memInicial = socioInicial ? membresiasDelSocio(socioInicial.id)[0] : null
    setForm({
      socioId: socioInicial?.id || '',
      membresiaId: memInicial?.id || '',
      monto: memInicial ? String(planDe(memInicial.planId)?.precio || '') : '',
      metodo: 'Efectivo',
    })
    setError('')
    setModal(true)
  }

  const alElegirSocio = (socioId) => {
    const mem = membresiasDelSocio(socioId)[0]
    setForm({
      ...form,
      socioId,
      membresiaId: mem?.id || '',
      monto: mem ? String(planDe(mem.planId)?.precio || '') : '',
    })
  }

  const alElegirMembresia = (membresiaId) => {
    const mem = membresias.find((m) => m.id === membresiaId)
    setForm({
      ...form,
      membresiaId,
      monto: mem ? String(planDe(mem.planId)?.precio || '') : form.monto,
    })
  }

  const registrar = (e) => {
    e.preventDefault()
    if (!form.socioId) {
      setError('Selecciona un socio.')
      return
    }
    if (!form.monto || Number(form.monto) <= 0) {
      setError('El monto debe ser mayor a 0.')
      return
    }
    acciones.agregarPago({
      socioId: form.socioId,
      membresiaId: form.membresiaId || null,
      monto: Number(form.monto),
      metodo: form.metodo,
      estado: 'pagado',
    })
    showToast('Pago registrado correctamente.')
    setModal(false)
  }

  const marcarPagado = (pago) => {
    acciones.marcarPagado(pago.id)
    showToast(`Pago de ${nombreSocio(pago.socioId)} marcado como pagado.`)
  }

  const mems = membresiasDelSocio(form.socioId)

  return (
    <>
      <PageHeader
        kicker="Control"
        title="Pagos"
        subtitle="Registro de recaudación, pagos pendientes y morosidad."
        actions={
          <button className="btn-solid" onClick={abrirNuevo}>
            <i className="bi bi-cash-coin me-1"></i>Registrar pago
          </button>
        }
      />

      <div className="row g-3 mb-3">
        <div className="col-sm-4">
          <StatCard label="Recaudado" value={formatMoney(stats.recaudado)} tone="court" />
        </div>
        <div className="col-sm-4">
          <StatCard
            label="Pendiente"
            value={formatMoney(stats.pendienteMonto)}
            sub={`${stats.pendienteN} pago(s) sin confirmar`}
            tone="alert"
          />
        </div>
        <div className="col-sm-4">
          <StatCard label="Movimientos" value={stats.total} sub="Pagos registrados" tone="steel" />
        </div>
      </div>

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
            { key: 'plan', label: 'Concepto' },
            { key: 'fecha', label: 'Fecha' },
            { key: 'monto', label: 'Monto' },
            { key: 'metodo', label: 'Método' },
            { key: 'estado', label: 'Estado' },
            { key: 'acc', label: '', className: 'text-end' },
          ]}
          isEmpty={lista.length === 0}
          emptyIcon="bi-cash-stack"
          emptyText="No hay pagos para este filtro."
        >
          {lista.map((p) => {
            const mem = membresias.find((m) => m.id === p.membresiaId)
            const plan = mem ? planDe(mem.planId) : null
            return (
              <tr key={p.id}>
                <td>
                  <Link
                    to={`/socios/${p.socioId}`}
                    style={{ color: 'var(--court-dark)', fontWeight: 600 }}
                  >
                    {nombreSocio(p.socioId)}
                  </Link>
                </td>
                <td>{plan ? plan.nombre : 'Pago general'}</td>
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
            )
          })}
        </DataTable>
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Registrar pago"
        footer={
          <>
            <button className="btn-outline-club" onClick={() => setModal(false)}>
              Cancelar
            </button>
            <button className="btn-solid" type="submit" form="form-pago">
              Guardar
            </button>
          </>
        }
      >
        <form id="form-pago" onSubmit={registrar}>
          {error && <div className="scan-result fail mb-3">{error}</div>}
          <div className="mb-3">
            <label className="form-label small fw-semibold text-steel">Socio</label>
            <select
              className="form-select"
              value={form.socioId}
              onChange={(e) => alElegirSocio(e.target.value)}
            >
              {socios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-steel">Membresía asociada</label>
            <select
              className="form-select"
              value={form.membresiaId}
              onChange={(e) => alElegirMembresia(e.target.value)}
            >
              <option value="">Pago general (sin membresía)</option>
              {mems.map((m) => (
                <option key={m.id} value={m.id}>
                  {planDe(m.planId)?.nombre || m.planId} · vence {formatDate(m.fechaFin)}
                </option>
              ))}
            </select>
          </div>
          <div className="row">
            <div className="col-6 mb-1">
              <label className="form-label small fw-semibold text-steel">Monto (CLP)</label>
              <input
                type="number"
                className="form-control"
                value={form.monto}
                onChange={(e) => setForm({ ...form, monto: e.target.value })}
              />
            </div>
            <div className="col-6 mb-1">
              <label className="form-label small fw-semibold text-steel">Método</label>
              <select
                className="form-select"
                value={form.metodo}
                onChange={(e) => setForm({ ...form, metodo: e.target.value })}
              >
                {METODOS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </>
  )
}
