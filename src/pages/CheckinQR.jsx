import { useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useClub } from '../context/ClubContext'
import { useToast } from '../context/ToastContext'
import { diasRestantes, estadoMembresia, membresiaVigenteDe } from '../utils/business'
import { formatDate } from '../utils/dates'
import PageHeader from '../components/ui/PageHeader'

export default function CheckinQR() {
  const { socios, actividades, membresias, acciones } = useClub()
  const { showToast } = useToast()

  const [credencialId, setCredencialId] = useState(socios[0]?.id || '')
  const [scanInput, setScanInput] = useState('')
  const [actividadId, setActividadId] = useState(actividades[0]?.id || '')
  const [resultado, setResultado] = useState(null)

  const socioCredencial = useMemo(
    () => socios.find((s) => s.id === credencialId),
    [socios, credencialId],
  )

  const validar = (e, codigo) => {
    if (e?.preventDefault) e.preventDefault()
    const id = (codigo ?? scanInput).trim()
    const socio = socios.find((s) => s.id === id || s.email === id)

    if (!socio) {
      setResultado({
        tipo: 'fail',
        contenido: (
          <>
            <strong>
              <i className="bi bi-x-circle me-1"></i>Código no reconocido.
            </strong>
            <br />
            No existe un socio con el código “{id}”.
          </>
        ),
      })
      return
    }

    const mem = membresiaVigenteDe(membresias, socio.id)
    const estado = mem ? estadoMembresia(mem) : 'vencida'

    if (!mem || estado === 'vencida') {
      setResultado({
        tipo: 'fail',
        contenido: (
          <>
            <strong>
              <i className="bi bi-x-circle me-1"></i>Acceso denegado — {socio.nombre}
            </strong>
            <br />
            {mem
              ? `Membresía vencida el ${formatDate(mem.fechaFin)}.`
              : 'No tiene una membresía registrada.'}
          </>
        ),
      })
      return
    }

    acciones.registrarAsistencia({ socioId: socio.id, actividadId, metodo: 'QR' })
    const hora = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })

    setResultado({
      tipo: 'ok',
      contenido: (
        <>
          <strong>
            <i className="bi bi-check-circle me-1"></i>Bienvenido/a, {socio.nombre}
          </strong>
          <br />
          Ingreso registrado a las {hora}.
          {estado === 'por_vencer' && (
            <>
              <br />
              <span className="text-alert">Su membresía vence en {diasRestantes(mem)} día(s).</span>
            </>
          )}
        </>
      ),
    })
    showToast(`Check-in registrado para ${socio.nombre}`)
  }

  return (
    <>
      <PageHeader
        kicker="Principal"
        title="Check-in QR"
        subtitle="Credencial QR por socio y lector simulado de recepción."
      />

      <div className="row g-3">
        <div className="col-lg-5">
          <div className="card-flat p-3 h-100">
            <h3 className="mb-3">Credencial del socio</h3>
            <select
              className="form-select mb-3"
              value={credencialId}
              onChange={(e) => setCredencialId(e.target.value)}
            >
              {socios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
            <div className="text-center">
              <div className="qr-credential">
                <QRCodeSVG value={credencialId} size={170} fgColor="#14181C" bgColor="#ffffff" />
                <div className="text-steel" style={{ fontSize: '0.82rem' }}>
                  Código: {credencialId}
                </div>
                {socioCredencial && <div className="fw-semibold">{socioCredencial.nombre}</div>}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card-flat p-3 h-100">
            <h3 className="mb-3">Lector de recepción</h3>
            <form className="row g-2 align-items-end mb-3" onSubmit={validar}>
              <div className="col-sm-6">
                <label className="form-label small fw-semibold text-steel">Código escaneado</label>
                <input
                  className="form-control"
                  placeholder="Ej: S001"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                />
              </div>
              <div className="col-sm-4">
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
              <div className="col-sm-2">
                <button className="btn-solid w-100" type="submit">
                  Validar
                </button>
              </div>
            </form>

            <div className="mb-3">
              <div className="small text-steel mb-1">Accesos rápidos (simular escaneo):</div>
              <div className="d-flex gap-2 flex-wrap">
                {socios.slice(0, 5).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="btn-outline-club"
                    onClick={() => validar(null, s.id)}
                  >
                    {s.nombre.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {resultado && <div className={`scan-result ${resultado.tipo}`}>{resultado.contenido}</div>}
          </div>
        </div>
      </div>
    </>
  )
}
