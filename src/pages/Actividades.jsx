import { useState } from 'react'
import { useClub } from '../context/ClubContext'
import { useToast } from '../context/ToastContext'
import { estadoMembresia } from '../utils/business'
import { today } from '../utils/dates'
import PageHeader from '../components/ui/PageHeader'
import Modal from '../components/ui/Modal'
import BarTrack from '../components/ui/BarTrack'
import EmptyState from '../components/ui/EmptyState'

const VACIO = { nombre: '', instructor: '', horario: '', cupo: 15, exterior: false }

export default function Actividades() {
  const { actividades, membresias, asistencias, acciones } = useClub()
  const { showToast } = useToast()
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(VACIO)
  const [error, setError] = useState('')

  const abrirNuevo = () => {
    setEditando(null)
    setForm(VACIO)
    setError('')
    setModal(true)
  }

  const abrirEditar = (a) => {
    setEditando(a.id)
    setForm({ ...VACIO, ...a, cupo: a.cupo })
    setError('')
    setModal(true)
  }

  const guardar = (e) => {
    e.preventDefault()
    if (form.nombre.trim().length < 3) {
      setError('El nombre de la actividad debe tener al menos 3 caracteres.')
      return
    }
    if (Number(form.cupo) <= 0) {
      setError('El cupo debe ser mayor a 0.')
      return
    }
    const datos = {
      nombre: form.nombre.trim(),
      instructor: form.instructor.trim(),
      horario: form.horario.trim(),
      cupo: Number(form.cupo),
      exterior: Boolean(form.exterior),
    }
    if (editando) {
      acciones.editarActividad({ id: editando, ...datos })
      showToast('Actividad actualizada.')
    } else {
      acciones.agregarActividad(datos)
      showToast('Actividad creada.')
    }
    setModal(false)
  }

  const eliminar = (a) => {
    if (!window.confirm(`¿Eliminar la actividad "${a.nombre}"?`)) return
    acciones.eliminarActividad(a.id)
    showToast('Actividad eliminada.', 'error')
  }

  return (
    <>
      <PageHeader
        kicker="Club"
        title="Actividades"
        subtitle="Clases y espacios del club, con su ocupación y asistencia diaria."
        actions={
          <button className="btn-solid" onClick={abrirNuevo}>
            <i className="bi bi-plus-lg me-1"></i>Nueva actividad
          </button>
        }
      />

      {actividades.length === 0 ? (
        <div className="card-flat">
          <EmptyState icon="bi-calendar-week">No hay actividades registradas.</EmptyState>
        </div>
      ) : (
        <div className="row g-3">
          {actividades.map((a) => {
            const inscritos = membresias.filter(
              (m) => m.actividadPreferida === a.id && estadoMembresia(m) !== 'vencida',
            ).length
            const asistHoy = asistencias.filter(
              (x) => x.actividadId === a.id && x.fecha === today(),
            ).length
            const pct = Math.min(100, Math.round((inscritos / a.cupo) * 100))
            return (
              <div className="col-md-6 col-xl-4" key={a.id}>
                <div className="card-flat p-3 h-100 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start">
                    <h3 className="mb-0">{a.nombre}</h3>
                    {a.exterior && (
                      <span className="badge-estado badge-por_vencer">
                        <i className="bi bi-sun"></i> Exterior
                      </span>
                    )}
                  </div>
                  <p className="text-steel mb-2" style={{ fontSize: '0.85rem' }}>
                    {a.instructor || 'Sin instructor asignado'}
                  </p>
                  <p style={{ fontSize: '0.85rem' }}>
                    <i className="bi bi-clock text-steel"></i> {a.horario || '—'}
                  </p>
                  <div className="d-flex justify-content-between" style={{ fontSize: '0.82rem' }}>
                    <span>Ocupación</span>
                    <span className="text-steel">
                      {inscritos}/{a.cupo}
                    </span>
                  </div>
                  <div className="mb-2">
                    <BarTrack value={pct} />
                  </div>
                  <p className="text-steel mb-3" style={{ fontSize: '0.8rem' }}>
                    {asistHoy} check-in(s) hoy
                  </p>
                  <div className="d-flex gap-2 mt-auto">
                    <button className="btn-outline-club flex-grow-1" onClick={() => abrirEditar(a)}>
                      <i className="bi bi-pencil me-1"></i>Editar
                    </button>
                    <button className="btn-outline-club text-alert" onClick={() => eliminar(a)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editando ? 'Editar actividad' : 'Nueva actividad'}
        footer={
          <>
            <button className="btn-outline-club" onClick={() => setModal(false)}>
              Cancelar
            </button>
            <button className="btn-solid" type="submit" form="form-actividad">
              Guardar
            </button>
          </>
        }
      >
        <form id="form-actividad" onSubmit={guardar}>
          {error && <div className="scan-result fail mb-3">{error}</div>}
          <div className="mb-3">
            <label className="form-label small fw-semibold text-steel">Nombre</label>
            <input
              className="form-control"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-steel">Instructor</label>
            <input
              className="form-control"
              value={form.instructor}
              onChange={(e) => setForm({ ...form, instructor: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-steel">Horario</label>
            <input
              className="form-control"
              placeholder="Lun / Mié / Vie · 19:00"
              value={form.horario}
              onChange={(e) => setForm({ ...form, horario: e.target.value })}
            />
          </div>
          <div className="row align-items-end">
            <div className="col-6 mb-1">
              <label className="form-label small fw-semibold text-steel">Cupo</label>
              <input
                type="number"
                className="form-control"
                value={form.cupo}
                onChange={(e) => setForm({ ...form, cupo: e.target.value })}
              />
            </div>
            <div className="col-6 mb-1">
              <div className="form-check mt-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="act-exterior"
                  checked={form.exterior}
                  onChange={(e) => setForm({ ...form, exterior: e.target.checked })}
                />
                <label className="form-check-label small" htmlFor="act-exterior">
                  Se realiza al aire libre
                </label>
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </>
  )
}
