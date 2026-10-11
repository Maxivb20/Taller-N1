import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { useClub } from '../context/ClubContext'
import { useToast } from '../context/ToastContext'
import { estadoMembresia, membresiaVigenteDe } from '../utils/business'
import { addDays, formatDate, formatWeekday, today } from '../utils/dates'
import { formatMoney } from '../utils/format'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import EstadoBadge from '../components/ui/EstadoBadge'
import BarTrack from '../components/ui/BarTrack'
import DataTable from '../components/ui/DataTable'
import WeatherWidget from '../components/WeatherWidget'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

export default function Dashboard() {
  const { socios, membresias, pagos, actividades, asistencias, acciones } = useClub()
  const { showToast } = useToast()

  const metricas = useMemo(() => {
    const estados = { activa: 0, por_vencer: 0, vencida: 0 }
    socios.forEach((s) => {
      const mem = membresiaVigenteDe(membresias, s.id)
      estados[mem ? estadoMembresia(mem) : 'vencida'] += 1
    })
    const pendientes = pagos.filter((p) => p.estado === 'pendiente')
    const hoy = today()
    return {
      estados,
      totalSocios: socios.length,
      morosidad: pendientes.reduce((sum, p) => sum + p.monto, 0),
      pagosPendientes: pendientes.length,
      checkinsHoy: asistencias.filter((a) => a.fecha === hoy).length,
    }
  }, [socios, membresias, pagos, asistencias])

  const chartData = useMemo(() => {
    const hoy = today()
    const labels = []
    const valores = []
    for (let offset = 6; offset >= 0; offset--) {
      const fecha = addDays(hoy, -offset)
      labels.push(formatWeekday(fecha))
      valores.push(asistencias.filter((a) => a.fecha === fecha).length)
    }
    return {
      labels,
      datasets: [
        {
          data: valores,
          backgroundColor: '#2F6844',
          borderRadius: 3,
          maxBarThickness: 34,
        },
      ],
    }
  }, [asistencias])

  const chartOptions = {
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#E8E3D6' } },
      x: { grid: { display: false } },
    },
  }

  const ultimos = useMemo(
    () =>
      [...asistencias]
        .sort((a, b) => (b.fecha + b.hora).localeCompare(a.fecha + a.hora))
        .slice(0, 6),
    [asistencias],
  )

  const totalMem = metricas.estados.activa + metricas.estados.por_vencer + metricas.estados.vencida || 1

  const nombreSocio = (id) => socios.find((s) => s.id === id)?.nombre || id
  const nombreActividad = (id) => actividades.find((a) => a.id === id)?.nombre || '—'

  const reiniciar = () => {
    if (!window.confirm('Esto restaurará los datos de ejemplo originales. ¿Continuar?')) return
    acciones.reiniciarDatos()
    showToast('Datos de ejemplo restaurados.')
  }

  return (
    <>
      <PageHeader
        kicker="Resumen general"
        title="Dashboard"
        subtitle={`Estado del club al día ${formatDate(today())}.`}
        actions={
          <button className="btn-outline-club" onClick={reiniciar}>
            <i className="bi bi-arrow-counterclockwise me-1"></i>Reiniciar datos de ejemplo
          </button>
        }
      />

      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <StatCard
            label="Socios activos"
            value={metricas.estados.activa}
            sub={`de ${metricas.totalSocios} socios totales`}
            tone="court"
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            label="Por vencer (≤ 7 días)"
            value={metricas.estados.por_vencer}
            sub="Requieren gestión de renovación"
            tone="amber"
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            label="Morosidad"
            value={formatMoney(metricas.morosidad)}
            sub={`${metricas.pagosPendientes} pago(s) pendiente(s)`}
            tone="alert"
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            label="Check-ins hoy"
            value={metricas.checkinsHoy}
            sub="Registrados vía QR y manual"
            tone="steel"
          />
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-lg-7">
          <div className="card-flat p-3 h-100">
            <h3 className="mb-1">Asistencia — últimos 7 días</h3>
            <p className="text-steel mb-3" style={{ fontSize: '0.85rem' }}>
              Check-ins totales registrados por día.
            </p>
            <Bar data={chartData} options={chartOptions} height={130} />
          </div>
        </div>
        <div className="col-lg-5">
          <div className="card-flat p-3 h-100">
            <h3 className="mb-1">Membresías por estado</h3>
            <p className="text-steel mb-3" style={{ fontSize: '0.85rem' }}>
              Distribución actual de la cartera de socios.
            </p>
            <Distribucion total={totalMem} estados={metricas.estados} />
          </div>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-lg-5">
          <WeatherWidget />
        </div>
      </div>

      <div className="card-flat p-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h3 className="mb-0">Últimos check-in</h3>
          <Link to="/asistencia" className="btn-ghost-sm">
            Ver todos <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
        <DataTable
          columns={[
            { key: 'socio', label: 'Socio' },
            { key: 'act', label: 'Actividad' },
            { key: 'fecha', label: 'Fecha' },
            { key: 'hora', label: 'Hora' },
            { key: 'metodo', label: 'Método' },
          ]}
          isEmpty={ultimos.length === 0}
          emptyIcon="bi-clipboard-x"
          emptyText="Sin registros aún."
        >
          {ultimos.map((a) => (
            <tr key={a.id}>
              <td>{nombreSocio(a.socioId)}</td>
              <td>{nombreActividad(a.actividadId)}</td>
              <td>{formatDate(a.fecha)}</td>
              <td>{a.hora}</td>
              <td>{a.metodo}</td>
            </tr>
          ))}
        </DataTable>
      </div>
    </>
  )
}

function Distribucion({ total, estados }) {
  const filas = [
    { label: 'Activa', n: estados.activa, color: 'var(--court)' },
    { label: 'Por vencer', n: estados.por_vencer, color: 'var(--amber)' },
    { label: 'Vencida', n: estados.vencida, color: 'var(--alert)' },
  ]
  return (
    <>
      {filas.map((f) => (
        <div className="mb-3" key={f.label}>
          <div className="d-flex justify-content-between" style={{ fontSize: '0.85rem' }}>
            <span>{f.label}</span>
            <span className="text-steel">{f.n}</span>
          </div>
          <BarTrack value={(f.n / total) * 100} color={f.color} />
        </div>
      ))}
    </>
  )
}
