import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import jsQR from 'jsqr'
import { useClub } from '../context/ClubContext'
import { useToast } from '../context/ToastContext'
import PageHeader from '../components/ui/PageHeader'
import {
  isMobileApp,
  playAccessTone,
  shareCredential,
  toggleTrackTorch,
  vibrateError,
  vibrateSuccess,
  vibrateTap,
} from '../services/mobileNative'

export default function CheckinQR() {
  const { socios, planes, membresias, actividades, acciones } = useClub()
  const { showToast } = useToast()

  const [credencialId, setCredencialId] = useState(socios[0]?.id || 'S001')
  const [scanInput, setScanInput] = useState('')
  const [actividadId, setActividadId] = useState(actividades[0]?.id || 'A01')
  const [resultado, setResultado] = useState(null)
  const [validando, setValidando] = useState(false)

  // Estados exclusivos de la versión Móvil (Cámara, Linterna, Vibración, Sonido, Sensor Shake)
  const [camaraActiva, setCamaraActiva] = useState(false)
  const [facingMode, setFacingMode] = useState('environment')
  const [linternaActiva, setLinternaActiva] = useState(false)
  const [linternaDisponible, setLinternaDisponible] = useState(false)
  const [errorCamara, setErrorCamara] = useState(null)
  const [sonidoActivo, setSonidoActivo] = useState(true)
  const [vibracionActiva, setVibracionActiva] = useState(true)
  const [shakeDetectado, setShakeDetectado] = useState(false)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(null)
  const ultimoCodigoRef = useRef('')

  const socioCredencial = useMemo(
    () => socios.find((s) => s.id === credencialId),
    [socios, credencialId],
  )

  const membresiaSocio = useMemo(() => {
    const lista = membresias
      .filter((m) => m.socioId === credencialId)
      .sort((a, b) => (a.fechaFin < b.fechaFin ? 1 : -1))
    return lista[0] || null
  }, [membresias, credencialId])

  const planSocio = useMemo(
    () => planes.find((p) => p.id === membresiaSocio?.planId),
    [planes, membresiaSocio],
  )

  const detenerCamara = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setCamaraActiva(false)
    setLinternaActiva(false)
    setLinternaDisponible(false)
  }, [])

  const validar = useCallback(
    async (e, codigo, origen = 'QR') => {
      if (e?.preventDefault) e.preventDefault()
      const id = (codigo ?? scanInput).trim()
      if (!id) {
        showToast('Ingresa o escanea un código QR.', 'error')
        return
      }

      setValidando(true)
      try {
        const res = await acciones.registrarAsistencia({
          codigo: id,
          actividadId,
          metodo: origen,
        })

        if (vibracionActiva) vibrateSuccess()
        if (sonidoActivo) playAccessTone(true)

        setResultado({
          tipo: 'ok',
          contenido: (
            <>
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <strong>
                  <i className="bi bi-check-circle-fill me-1"></i>ACCESO AUTORIZADO · {res.socio.nombre}
                </strong>
                <span className="badge bg-success">HAPTIC + AUDIO OK</span>
              </div>
              <div className="mt-1">
                Ingreso registrado a las <strong>{res.asistencia.hora}</strong> (folio{' '}
                <code>{res.asistencia.id}</code>).
              </div>
              {res.estadoMembresia === 'por_vencer' && (
                <div className="text-alert mt-1">
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  Atención: su membresía vence en {res.diasRestantes} día(s).
                </div>
              )}
            </>
          ),
        })
        showToast(`Check-in autorizado: ${res.socio.nombre}`)
      } catch (err) {
        if (vibracionActiva) vibrateError()
        if (sonidoActivo) playAccessTone(false)

        setResultado({
          tipo: 'fail',
          contenido: (
            <>
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <strong>
                  <i className="bi bi-x-octagon-fill me-1"></i>ACCESO DENEGADO
                </strong>
                <span className="badge bg-danger">ALERTA HÁPTICA MÓVIL</span>
              </div>
              <div className="mt-1">{err.message}</div>
              {err.details?.accessLog && (
                <div className="mt-1 small">
                  Intento rechazado guardado en MongoDB (<code>{err.details.accessLog.id}</code>).
                </div>
              )}
            </>
          ),
        })
        showToast(err.message || 'Acceso denegado.', 'error')
      } finally {
        setValidando(false)
      }
    },
    [acciones, actividadId, scanInput, showToast, sonidoActivo, vibracionActiva],
  )

  // Escaneo continuo de fotogramas de la cámara usando jsQR
  const iniciarLoopEscaneo = useCallback(() => {
    const loop = () => {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || !streamRef.current) return

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          })

          if (code && code.data && code.data.trim()) {
            const limpio = code.data.trim()
            if (limpio !== ultimoCodigoRef.current) {
              ultimoCodigoRef.current = limpio
              setScanInput(limpio)
              detenerCamara()
              validar(null, limpio, 'QR')
              setTimeout(() => {
                ultimoCodigoRef.current = ''
              }, 2500)
              return
            }
          }
        }
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
  }, [detenerCamara, validar])

  const iniciarCamara = useCallback(
    async (modo = facingMode) => {
      setErrorCamara(null)
      detenerCamara()

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorCamara('Este dispositivo no expone acceso directo a la cámara.')
        return
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: modo },
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        })

        streamRef.current = stream
        setCamaraActiva(true)

        const track = stream.getVideoTracks()[0]
        if (track && typeof track.getCapabilities === 'function') {
          const caps = track.getCapabilities()
          setLinternaDisponible(Boolean(caps && caps.torch))
        }

        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            videoRef.current.setAttribute('playsinline', 'true')
            videoRef.current.play().catch(() => {})
            iniciarLoopEscaneo()
          }
        }, 120)
      } catch (err) {
        setErrorCamara(
          `No se pudo abrir la cámara (${err.name || 'Permiso'}). Verifica haber aceptado el permiso de cámara en Android.`,
        )
      }
    },
    [detenerCamara, facingMode, iniciarLoopEscaneo],
  )

  const alternarCamara = () => {
    vibrateTap()
    const nuevoModo = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(nuevoModo)
    if (camaraActiva) {
      iniciarCamara(nuevoModo)
    }
  }

  const alternarLinterna = async () => {
    vibrateTap()
    if (!streamRef.current) return
    const track = streamRef.current.getVideoTracks()[0]
    const nuevoEstado = !linternaActiva
    const ok = await toggleTrackTorch(track, nuevoEstado)
    if (ok) {
      setLinternaActiva(nuevoEstado)
      showToast(nuevoEstado ? 'Linterna activada' : 'Linterna apagada')
    } else {
      showToast('El flash/linterna solo está disponible en la cámara trasera de un teléfono físico.', 'error')
    }
  }

  // Sensor de movimiento móvil (Shake / Agitar el celular para escanear o rotar credencial)
  useEffect(() => {
    let lastX = 0
    let lastY = 0
    let lastZ = 0
    let lastShakeTime = 0

    const onMotion = (event) => {
      const acc = event.accelerationIncludingGravity
      if (!acc) return
      const now = Date.now()
      if (now - lastShakeTime < 1800) return

      const delta = Math.abs((acc.x || 0) - lastX) + Math.abs((acc.y || 0) - lastY) + Math.abs((acc.z || 0) - lastZ)
      if (delta > 32) {
        lastShakeTime = now
        setShakeDetectado(true)
        vibrateTap()
        setTimeout(() => setShakeDetectado(false), 1500)
      }
      lastX = acc.x || 0
      lastY = acc.y || 0
      lastZ = acc.z || 0
    }

    window.addEventListener('devicemotion', onMotion)
    return () => {
      window.removeEventListener('devicemotion', onMotion)
      detenerCamara()
    }
  }, [detenerCamara])

  const handleCompartirCredencial = async () => {
    vibrateTap()
    if (!socioCredencial) return
    const ok = await shareCredential({
      socioId: socioCredencial.id,
      socioNombre: socioCredencial.nombre,
      planNombre: planSocio?.nombre || 'Sin plan',
      estado: membresiaSocio ? 'Vigente' : 'Sin membresía',
    })
    if (ok) {
      showToast('Credencial lista para compartir en el teléfono.')
    }
  }

  return (
    <>
      <PageHeader
        kicker="Principal · Funcionalidad Exclusiva Móvil (Android)"
        title="Escáner Cámara QR & Credencial Móvil"
        subtitle="Lector de cámara nativa con linterna, vibración háptica diferenciada, alertas sonoras de torniquete y sensor de movimiento."
        actions={
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="badge bg-dark">
              <i className="bi bi-phone me-1"></i>
              {isMobileApp() ? 'Ejecutando en Android APK' : 'Vista Previa Web / Móvil'}
            </span>
            <button
              type="button"
              className={`btn-outline-club btn-sm ${vibracionActiva ? 'active' : ''}`}
              onClick={() => {
                const next = !vibracionActiva
                setVibracionActiva(next)
                if (next) vibrateSuccess()
              }}
            >
              <i className="bi bi-phone-vibrate me-1"></i>
              Vibración: {vibracionActiva ? 'ON' : 'OFF'}
            </button>
            <button
              type="button"
              className={`btn-outline-club btn-sm ${sonidoActivo ? 'active' : ''}`}
              onClick={() => {
                const next = !sonidoActivo
                setSonidoActivo(next)
                if (next) playAccessTone(true)
              }}
            >
              <i className={`bi ${sonidoActivo ? 'bi-volume-up-fill' : 'bi-volume-mute-fill'} me-1`}></i>
              Sonido: {sonidoActivo ? 'ON' : 'OFF'}
            </button>
          </div>
        }
      />

      {shakeDetectado && (
        <div className="alert alert-info py-2 mb-3 d-flex align-items-center gap-2">
          <i className="bi bi-phone-vibrate-fill"></i>
          <span>
            <strong>Sensor acelerómetro detectado:</strong> teléfono agitado — lector listo para nuevo ingreso.
          </span>
        </div>
      )}

      <div className="row g-3">
        {/* COLUMNA 1: ESCÁNER DE CÁMARA NATIVA MÓVIL */}
        <div className="col-lg-7">
          <div className="card-flat p-3 h-100">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <div>
                <h3 className="mb-0">
                  <i className="bi bi-camera-video me-2 text-accent"></i>
                  Escáner QR con Cámara del Teléfono
                </h3>
                <div className="small text-steel">
                  Apunta la cámara al código QR del socio para validar su membresía en tiempo real.
                </div>
              </div>
              <div className="d-flex gap-2">
                {!camaraActiva ? (
                  <button
                    type="button"
                    className="btn-solid"
                    onClick={() => {
                      vibrateTap()
                      iniciarCamara()
                    }}
                  >
                    <i className="bi bi-camera-fill me-1"></i>Abrir cámara QR
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn-outline-club"
                      onClick={alternarCamara}
                      title="Cambiar entre cámara trasera y frontal"
                    >
                      <i className="bi bi-arrow-repeat me-1"></i>Girar
                    </button>
                    <button
                      type="button"
                      className={`btn-outline-club ${linternaActiva ? 'active' : ''}`}
                      onClick={alternarLinterna}
                      title="Encender flash / linterna"
                    >
                      <i className={`bi ${linternaActiva ? 'bi-lightning-charge-fill' : 'bi-lightning-charge'} me-1`}></i>
                      {linternaDisponible ? (linternaActiva ? 'Flash ON' : 'Flash') : 'Linterna'}
                    </button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={detenerCamara}>
                      <i className="bi bi-stop-circle me-1"></i>Cerrar
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* VISOR DE CÁMARA EN VIVO */}
            {camaraActiva ? (
              <div className="camera-scanner-box mb-3">
                <video ref={videoRef} className="camera-video" muted playsInline />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <div className="camera-overlay">
                  <div className="camera-target-frame">
                    <div className="camera-scan-laser"></div>
                  </div>
                  <div className="camera-hint">
                    Encuadra el código QR dentro del marco · Detección automática activa
                  </div>
                </div>
              </div>
            ) : (
              <div className="camera-placeholder mb-3">
                <i className="bi bi-qr-code-scan" style={{ fontSize: '2.4rem', color: 'var(--accent)' }}></i>
                <div className="fw-semibold mt-2">Cámara móvil en espera</div>
                <div className="small text-steel mb-2">
                  Presiona <strong>&ldquo;Abrir cámara QR&rdquo;</strong> para usar el lente del teléfono o usa los botones de prueba rápida abajo.
                </div>
                <div className="d-flex justify-content-center gap-2 flex-wrap">
                  <span className="badge bg-secondary">
                    <i className="bi bi-camera me-1"></i>Cámara trasera/frontal
                  </span>
                  <span className="badge bg-secondary">
                    <i className="bi bi-phone-vibrate me-1"></i>Vibración háptica
                  </span>
                  <span className="badge bg-secondary">
                    <i className="bi bi-volume-up me-1"></i>Audio torniquete
                  </span>
                  <span className="badge bg-secondary">
                    <i className="bi bi-lightning-charge me-1"></i>Control de Flash
                  </span>
                </div>
              </div>
            )}

            {errorCamara && (
              <div className="alert alert-warning py-2 small mb-3">
                <i className="bi bi-exclamation-circle me-1"></i>
                {errorCamara}
              </div>
            )}

            <form className="row g-2 align-items-end mb-3" onSubmit={(e) => validar(e, scanInput, 'QR')}>
              <div className="col-sm-6">
                <label className="form-label small fw-semibold text-steel">Código detectado o manual</label>
                <input
                  className="form-control"
                  placeholder="Ej: S001 o correo"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                />
              </div>
              <div className="col-sm-4">
                <label className="form-label small fw-semibold text-steel">Actividad de destino</label>
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
                <button className="btn-solid w-100" type="submit" disabled={validando}>
                  {validando ? '…' : 'Validar'}
                </button>
              </div>
            </form>

            <div className="mb-3">
              <div className="small text-steel mb-1">
                Simular lectura QR (prueba vibración y sonido de autorizado vs rechazado):
              </div>
              <div className="d-flex gap-2 flex-wrap">
                {socios.slice(0, 6).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="btn-outline-club"
                    disabled={validando}
                    onClick={() => validar(null, s.id, 'QR')}
                  >
                    <i className="bi bi-qr-code me-1"></i>
                    {s.nombre.split(' ')[0]} ({s.id})
                  </button>
                ))}
              </div>
            </div>

            {resultado && <div className={`scan-result ${resultado.tipo}`}>{resultado.contenido}</div>}
          </div>
        </div>

        {/* COLUMNA 2: CREDENCIAL DIGITAL MÓVIL DEL SOCIO */}
        <div className="col-lg-5">
          <div className="card-flat p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="mb-0">
                <i className="bi bi-person-Vcard me-2"></i>
                Pase Digital Móvil
              </h3>
              <button
                type="button"
                className="btn-outline-club btn-sm"
                onClick={handleCompartirCredencial}
                title="Compartir credencial usando el menú nativo de Android"
              >
                <i className="bi bi-share-fill me-1"></i>Compartir pase
              </button>
            </div>

            <select
              className="form-select mb-3"
              value={credencialId}
              onChange={(e) => {
                vibrateTap()
                setCredencialId(e.target.value)
              }}
            >
              {socios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} ({s.id})
                </option>
              ))}
            </select>

            <div className="text-center">
              <div className="qr-credential">
                <div className="small fw-bold text-uppercase mb-1" style={{ letterSpacing: '0.08em', color: 'var(--accent)' }}>
                  CLUBTRACK MOBILE PASS
                </div>
                <QRCodeSVG
                  value={credencialId || 'S001'}
                  size={175}
                  fgColor="#14181C"
                  bgColor="#ffffff"
                />
                <div className="text-steel mt-2" style={{ fontSize: '0.82rem' }}>
                  ID Socio: <strong>{credencialId}</strong>
                </div>
                {socioCredencial && <div className="fw-bold fs-5">{socioCredencial.nombre}</div>}
                <div className="small text-steel">
                  {planSocio ? `${planSocio.nombre} · Vence: ${membresiaSocio?.fechaFin}` : 'Sin plan activo'}
                </div>
              </div>
            </div>

            <div className="mt-3 p-2 rounded" style={{ background: 'var(--surface-2)', fontSize: '0.82rem' }}>
              <div className="fw-semibold mb-1">
                <i className="bi bi-phone-fill me-1 text-accent"></i>
                Funciones exclusivas de esta APK móvil:
              </div>
              <ul className="mb-0 ps-3 text-steel">
                <li>
                  <strong>Cámara lectora QR en vivo:</strong> decodifica cualquier QR apuntando con la cámara del celular.
                </li>
                <li>
                  <strong>Respuesta háptica (Vibración):</strong> doble vibración corta al autorizar y triple vibración larga si el socio tiene la membresía vencida.
                </li>
                <li>
                  <strong>Tonos de torniquete:</strong> sonido agudo de aprobación o alarma grave de rechazo.
                </li>
                <li>
                  <strong>Compartir nativo &amp; Sensor Shake:</strong> permite compartir el pase por WhatsApp y detecta cuando agitas el teléfono.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
