import { useState } from 'react'
import { useClub } from '../context/ClubContext'
import { useToast } from '../context/ToastContext'
import PageHeader from '../components/ui/PageHeader'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import EstadoBadge from '../components/ui/EstadoBadge'

const VACIO = {
  nombre: '',
  especialidad: '',
  email: '',
  telefono: '',
  bio: '',
  activo: true,
}

export default function Instructores() {
  const { instructores, actividades, acciones } = useClub()
  const { showToast } = useToast()

  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(VACIO)
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  const abrirNuevo = () => {
    setEditando(null)
    setForm(VACIO)
    setError('')
    setModal(true)
  }

  const abrirEditar = (inst) => {
    setEditando(inst.id)
    setForm({
      nombre: inst.nombre,
      especialidad: inst.especialidad,
      email: inst.email,
      telefono: inst.telefono,
      bio: inst.bio || '',
      activo: Boolean(inst.activo),
    })
    setError('')
    setModal(true)
  }

  const guardar = async (e) => {
    e.preventDefault()
    if (form.nombre.trim().length < 3) {
      setError('El nombre del instructor debe tener al menos 3 caracteres.')
      return
    }
    if (form.especialidad.trim().length < 3) {
      setError('Ingresa la especialidad del instructor.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError('Ingresa un correo electrónico válido.')
      return
    }
    if (form.telefono.trim().length < 8) {
      setError('Ingresa un teléfono válido.')
      return
    }

    setGuardando(true)
    setError('')
    try {
      if (editando) {
        await acciones.editarInstructor({ id: editando, ...form })
        showToast('Instructor actualizado.')
      } else {
        await acciones.agregarInstructor(form)
        showToast('Instructor registrado.')
      }
      setModal(false)
    } catch (err) {
      setError(err.message || 'No se pudo guardar el instructor.')
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (inst) => {
    if (!window.confirm(`¿Eliminar el perfil de ${inst.nombre}?`)) return
    try {
      await acciones.eliminarInstructor(inst.id)
      showToast('Instructor eliminado.', 'error')
    } catch (err) {
      showToast(err.message || 'Error al eliminar instructor.', 'error')
    }
  }

  return (
    <>
      <PageHeader
        kicker="Club"
        title="Instructores"
        subtitle="Equipo de entrenadores y profesores a cargo de las actividades."
        actions={
          <button className="btn-solid" onClick={abrirNuevo}>
            <i className="bi bi-person-plus me-1"></i>Nuevo instructor
          </button>
        }
      />

      {instructores.length === 0 ? (
        <div className="card-flat">
          <EmptyState icon="bi-person-badge">No hay instructores registrados.</EmptyState>
        </div>
      ) : (
        <div className="row g-3">
          {instructores.map((inst) => {
            const clasesACargo = actividades.filter((a) => a.instructorId === inst.id)
            return (
              <div className="col-md-6 col-xl-4" key={inst.id}>
                <div className="card-flat p-3 h-100 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <div>
                      <h3 className="mb-0">{inst.nombre}</h3>
                      <div className="text-court fw-semibold" style={{ fontSize: '0.84rem' }}>
                        {inst.especialidad}
                      </div>
                    </div>
                    <EstadoBadge estado={inst.activo ? 'activa' : 'vencida'} />
                  </div>

                  <p className="text-steel mt-2 flex-grow-1" style={{ fontSize: '0.86rem' }}>
                    {inst.bio || 'Sin biografía registrada.'}
                  </p>

                  <div className="mb-2" style={{ fontSize: '0.82rem' }}>
                    <div>
                      <i className="bi bi-envelope text-steel me-1"></i>
                      {inst.email}
                    </div>
                    <div>
                      <i className="bi bi-telephone text-steel me-1"></i>
                      {inst.telefono}
                    </div>
                  </div>

                  <div className="mb-3">
                    <span className="text-steel" style={{ fontSize: '0.78rem' }}>
                      Actividades a cargo ({clasesACargo.length}):{' '}
                    </span>
                    {clasesACargo.length === 0 ? (
                      <span className="text-steel" style={{ fontSize: '0.78rem' }}>
                        Ninguna asignada
                      </span>
                    ) : (
                      clasesACargo.map((c) => (
                        <span
                          key={c.id}
                          className="badge-estado badge-activa me-1 mt-1"
                          style={{ display: 'inline-flex' }}
                        >
                          {c.nombre}
                        </span>
                      ))
                    )}
                  </div>

                  <div className="d-flex gap-2 mt-auto">
                    <button
                      className="btn-outline-club flex-grow-1"
                      onClick={() => abrirEditar(inst)}
                    >
                      <i className="bi bi-pencil me-1"></i>Editar
                    </button>
                    <button
                      className="btn-outline-club text-alert"
                      onClick={() => eliminar(inst)}
                    >
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
        title={editando ? 'Editar instructor' : 'Nuevo instructor'}
        footer={
          <>
            <button className="btn-outline-club" onClick={() => setModal(false)}>
              Cancelar
            </button>
            <button className="btn-solid" type="submit" form="form-instructor" disabled={guardando}>
              {guardando ? 'Guardando…' : 'Guardar'}
            </button>
          </>
        }
      >
        <form id="form-instructor" onSubmit={guardar}>
          {error && <div className="scan-result fail mb-3">{error}</div>}
          <div className="mb-3">
            <label className="form-label small fw-semibold text-steel">Nombre completo</label>
            <input
              className="form-control"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-steel">Especialidad</label>
            <input
              className="form-control"
              placeholder="Ej: Entrenamiento Funcional & HIIT"
              value={form.especialidad}
              onChange={(e) => setForm({ ...form, especialidad: e.target.value })}
            />
          </div>
          <div className="row">
            <div className="col-6 mb-3">
              <label className="form-label small fw-semibold text-steel">Correo</label>
              <input
                type="email"
                className="form-control"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="col-6 mb-3">
              <label className="form-label small fw-semibold text-steel">Teléfono</label>
              <input
                className="form-control"
                placeholder="+56 9 ..."
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-steel">Biografía / Certificaciones</label>
            <textarea
              className="form-control"
              rows="2"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="inst-activo"
              checked={form.activo}
              onChange={(e) => setForm({ ...form, activo: e.target.checked })}
            />
            <label className="form-check-label small" htmlFor="inst-activo">
              Instructor activo en cartelera
            </label>
          </div>
        </form>
      </Modal>
    </>
  )
}
