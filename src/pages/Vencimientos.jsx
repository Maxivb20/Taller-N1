import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useClub } from '../context/ClubContext'
import { useToast } from '../context/ToastContext'
import { diasRestantes, estadoMembresia, membresiaVigenteDe } from '../utils/business'
import { formatDate } from '../utils/dates'
import { formatMoney } from '../utils/format'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import DataTable from '../components/ui/DataTable'

function EnlaceSocio({ socioId, nombre }) {
  return (
    <Link to={`/socios/${socioId}`} style={{ color: 'var(--court-dark)', fontWeight: 600 }}>
      {nombre}
    </Link>
  )
}

export default function Vencimientos() {
  const { socios, planes, membresias, pagos, acciones } = useClub()
  const { showToast } = useToast()

  const planDe = (id) => planes.find((p) => p.id === id)
  const nombreSocio = (id) => socios.find((s) => s.id === id)?.nombre || id

  const { porVencer, vencidas, morosidad, morosidadMonto } = useMemo(() => {
    const porVencer = []
    const vencidas = []
    socios.forEach((s) => {
      const mem = membresiaVigenteDe(membresias, s.id)
      const estado = mem ? estadoMembresia(mem) : 'vencida'
      const item = { socio: s, mem, estado }
      if (estado === 'por_vencer') porVencer.push(item)
      if (estado === 'vencida') vencidas.push(item)
    })
    porVencer.sort((a, b) => diasRestantes(a.mem) - diasRestantes(b.mem))
    vencidas.sort((a, b) => (a.mem?.fechaFin || '').localeCompare(b.mem?.fechaFin || ''))

    const morosidad = [...pagos]
      .filter((p) => p.estado === 'pendiente')
      .sort((a, b) => a.fecha.localeCompare(b.fecha))

    return {
      porVencer,
      vencidas,
      morosidad,
      morosidadMonto: morosidad.reduce((s, p) => s + p.monto, 0),
    }
  }, [socios, membresias, pagos])

  const marcarPagado = (pago) => {
    acciones.marcarPagado(pago.id)
    showToast(`Pago de ${nombreSocio(pago.socioId)} marcado como pagado.`)
  }

  return (
    <>
      <PageHeader
        kicker="Control"
        title="Vencimientos"
        subtitle="Seguimiento de membresías por vencer, vencidas y deuda pendiente."
      />

      <div className="row g-3 mb-4">
        <div className="col-sm-4">
          <StatCard
            label="Por vencer (≤ 7 días)"
            value={porVencer.length}
            sub="Socios a contactar para renovar"
            tone="amber"
          />
        </div>
        <div className="col-sm-4">
          <StatCard
            label="Membresías vencidas"
            value={vencidas.length}
            sub="Requieren reactivación"
            tone="alert"
          />
        </div>
        <div className="col-sm-4">
          <StatCard
            label="Morosidad"
            value={formatMoney(morosidadMonto)}
            sub={`${morosidad.length} pago(s) pendiente(s)`}
            tone="steel"
          />
        </div>
      </div>

      <div className="card-flat p-3 mb-3">
        <h3 className="mb-3">
          <i className="bi bi-hourglass-split me-1" style={{ color: 'var(--amber)' }}></i>Por vencer en los próximos 7 días
        </h3>
        <DataTable
          columns={[
            { key: 'socio', label: 'Socio' },
            { key: 'plan', label: 'Plan' },
            { key: 'vence', label: 'Vence' },
            { key: 'restantes', label: 'Días restantes' },
            { key: 'acc', label: '', className: 'text-end' },
          ]}
          isEmpty={porVencer.length === 0}
          emptyIcon="bi-emoji-smile"
          emptyText="Ninguna membresía vence en los próximos 7 días."
        >
          {porVencer.map(({ socio, mem }) => (
            <tr key={socio.id}>
              <td>
                <EnlaceSocio socioId={socio.id} nombre={socio.nombre} />
              </td>
              <td>{planDe(mem.planId)?.nombre || '—'}</td>
              <td>{formatDate(mem.fechaFin)}</td>
              <td className="fw-semibold" style={{ color: 'var(--amber)' }}>
                {diasRestantes(mem)} día(s)
              </td>
              <td className="text-end">
                <Link to="/membresias" className="btn-ghost-sm" title="Ir a membresías">
                  <i className="bi bi-arrow-repeat"></i>
                </Link>
              </td>
            </tr>
          ))}
        </DataTable>
      </div>

      <div className="card-flat p-3 mb-3">
        <h3 className="mb-3">
          <i className="bi bi-exclamation-octagon me-1 text-alert"></i>Membresías vencidas
        </h3>
        <DataTable
          columns={[
            { key: 'socio', label: 'Socio' },
            { key: 'plan', label: 'Último plan' },
            { key: 'vence', label: 'Vencida el' },
            { key: 'dias', label: 'Días vencida' },
            { key: 'acc', label: '', className: 'text-end' },
          ]}
          isEmpty={vencidas.length === 0}
          emptyIcon="bi-check2-all"
          emptyText="No hay membresías vencidas."
        >
          {vencidas.map(({ socio, mem }) => (
            <tr key={socio.id}>
              <td>
                <EnlaceSocio socioId={socio.id} nombre={socio.nombre} />
              </td>
              <td>{mem ? planDe(mem.planId)?.nombre || '—' : 'Sin membresía'}</td>
              <td>{mem ? formatDate(mem.fechaFin) : '—'}</td>
              <td className="text-alert">
                {mem ? `${Math.abs(diasRestantes(mem))} día(s)` : '—'}
              </td>
              <td className="text-end">
                <Link to="/membresias" className="btn-ghost-sm" title="Ir a membresías">
                  <i className="bi bi-arrow-repeat"></i>
                </Link>
              </td>
            </tr>
          ))}
        </DataTable>
      </div>

      <div className="card-flat p-3">
        <h3 className="mb-3">
          <i className="bi bi-cash-stack me-1 text-steel"></i>Morosidad — pagos pendientes
        </h3>
        <DataTable
          columns={[
            { key: 'socio', label: 'Socio' },
            { key: 'fecha', label: 'Fecha emisión' },
            { key: 'monto', label: 'Monto' },
            { key: 'acc', label: '', className: 'text-end' },
          ]}
          isEmpty={morosidad.length === 0}
          emptyIcon="bi-wallet2"
          emptyText="No hay pagos pendientes."
        >
          {morosidad.map((p) => (
            <tr key={p.id}>
              <td>
                <EnlaceSocio socioId={p.socioId} nombre={nombreSocio(p.socioId)} />
              </td>
              <td>{formatDate(p.fecha)}</td>
              <td className="fw-semibold">{formatMoney(p.monto)}</td>
              <td className="text-end">
                <button className="btn-solid" onClick={() => marcarPagado(p)}>
                  Marcar pagado
                </button>
              </td>
            </tr>
          ))}
        </DataTable>
      </div>
    </>
  )
}
