import { useMemo, useState } from 'react'
import { useClub } from '../context/ClubContext'
import { useToast } from '../context/ToastContext'
import { diasRestantes, estadoMembresia, membresiaVigenteDe } from '../utils/business'
import { formatDate, today } from '../utils/dates'
import PageHeader from '../components/ui/PageHeader'
import DataTable from '../components/ui/DataTable'
import EstadoBadge from '../components/ui/EstadoBadge'

export default function Asistencia() {
  const { socios, actividades, membresias, accessLogs, acciones } = useClub()
  const { showToast } = useToast()

  const [socioId, setSocioId] = useState(socios[0]?.id || '')
  const [actividadId, setActividadId] = useState(actividades[0]?.id || '')
  const [fecha, setFecha] = useState(today())
  const [incluirRechazos, setIncluirRechazos] = useState(true)
  const [registrando, setRegistrando] = useState(false)

  const mem = useMemo(() => membresiaVigenteDe(membresias, socioId), [membresias, socioId])
  const estado = mem ? estadoMembresia(mem) : 'vencida'

  const aviso = useMemo(() => {
    if (!mem) return { tipo: 'fail', texto: 'Este socio no tiene una membresía registrada.' }
    if (estado === 'vencida')
      return {
        tipo: 'fail',
        texto: `Membresía vencida el ${formatDate(mem.fechaFin)}. No se autorizará el ingreso.`,
      }
    if (estado === 'por_vencer')
      return {
        tipo: 'ok',
        texto: `Membresía vigente, pero vence en ${diasRestantes(mem)} día(s).`,
      }
    return null
  }, [mem, estado])

  const lista = useMemo(
    () =>
      accessLogs
        .filter((a) => (!fecha || a.fecha === fecha) && (incluirRechazos || a.autorizado))
        .sort((a, b) => b.hora.localeCompare(a.hora)),
    [accessLogs, fecha, incluirRechazos],
  )

  const registrar = async (e) => {
    e.preventDefault()
    setRegistrando(true)
    try {
      await acciones.registrarAsistencia({ socioId, actividadId, metodo: 'Manual' })
      showToast('Asistencia registrada.')
    } catch (err) {
      showToast(err.message || 'No se pudo registrar el ingreso.', 'error')
    } finally {
      setRegistrando(false)
    }
  }

  const nombreSocio = (id) => socios.find((s) => s.id === id)?.nombre || id
  const nombreActividad = (id) => actividades.find((a) => a.id === id)?.nombre || '—'

  return (
    <>
      <PageHeader
        kicker="Control"
        title="Asistencia"
        subtitle="Check-in manual con validación de vigencia e historial diario."
      />

      <div className="row g-3">
        <div className="col-lg-4">
          <div className="card-flat p-3">
            <h3 className="mb-3">Registrar ingreso</h3>
            <form onSubmit={registrar}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-steel">Socio</label>
                <select
                  className="form-select"
                  value={socioId}
                  onChange={(e) => setSocioId(e.target.value)}
                >
                  {socios.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-steel">Actividad</label>
                <select
                  className="form-select"
                  value={actividadId}
                  onChange={(e) => setActividadId(e.target.value)}
                >
                  {actividades.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {aviso && <div className={`scan-result ${aviso.tipo} mb-3`}>{aviso.texto}</div>}

              <button
                className="btn-solid w-100"
                type="submit"
                disabled={registrando}
              >
                <i className="bi bi-check2-circle me-1"></i>
                {registrando ? 'Validando…' : 'Registrar check-in'}
              </button>
            </form>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card-flat p-3">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <div>
                <h3 className="mb-0">Historial del día</h3>
                <div className="form-check mt-1">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="chk-rechazos"
                    checked={incluirRechazos}
                    onChange={(e) => setIncluirRechazos(e.target.checked)}
                  />
                  <label className="form-check-label small text-steel" htmlFor="chk-rechazos">
                    Incluir intentos de acceso denegados
                  </label>
                </div>
              </div>
              <input
                type="date"
                className="form-control"
                style={{ maxWidth: 190 }}
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>
            <DataTable
              columns={[
                { key: 'socio', label: 'Socio' },
                { key: 'act', label: 'Actividad' },
                { key: 'hora', label: 'Hora' },
                { key: 'metodo', label: 'Método' },
                { key: 'estado', label: 'Resultado' },
              ]}
              isEmpty={lista.length === 0}
              emptyIcon="bi-clipboard-x"
              emptyText="Sin registros para esta fecha."
            >
              {lista.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div className="fw-semibold">{a.socioNombre || nombreSocio(a.socioId)}</div>
                    <div className="text-steel" style={{ fontSize: '0.75rem' }}>
                      {a.motivo}
                    </div>
                  </td>
                  <td>{a.actividadNombre || nombreActividad(a.actividadId)}</td>
                  <td>{a.hora}</td>
                  <td>{a.metodo}</td>
                  <td>
                    <EstadoBadge estado={a.autorizado ? 'autorizado' : 'denegado'} />
                  </td>
                </tr>
              ))}
            </DataTable>
          </div>
        </div>
      </div>
    </>
  )
}
