import { useState } from 'react'
import { useClub } from '../context/ClubContext'
import { useToast } from '../context/ToastContext'
import { estadoMembresia } from '../utils/business'
import { formatMoney } from '../utils/format'
import PageHeader from '../components/ui/PageHeader'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'

const VACIO = { nombre: '', descripcion: '', precio: '', duracionDias: 30, actividades: '' }

export default function Planes() {
  const { planes, membresias, acciones } = useClub()
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

  const abrirEditar = (plan) => {
    setEditando(plan.id)
    setForm({
      nombre: plan.nombre,
      descripcion: plan.descripcion || '',
      precio: plan.precio,
      duracionDias: plan.duracionDias,
      actividades: (plan.actividades || []).join(', '),
    })
    setError('')
    setModal(true)
  }

  const guardar = (e) => {
    e.preventDefault()
    if (form.nombre.trim().length < 3) {
      setError('El nombre del plan debe tener al menos 3 caracteres.')
      return
    }
    if (!form.precio || Number(form.precio) <= 0) {
      setError('El precio debe ser un número mayor a 0.')
      return
    }
    const datos = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      precio: Number(form.precio),
      duracionDias: Number(form.duracionDias) || 30,
      actividades: form.actividades
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    }
    if (editando) {
      acciones.editarPlan({ id: editando, ...datos })
      showToast('Plan actualizado.')
    } else {
      acciones.agregarPlan(datos)
      showToast('Plan creado correctamente.')
    }
    setModal(false)
  }

  const eliminar = (plan) => {
    if (membresias.some((m) => m.planId === plan.id)) {
      showToast('No se puede eliminar: hay membresías asociadas a este plan.', 'error')
      return
    }
    if (!window.confirm(`¿Eliminar el plan "${plan.nombre}"?`)) return
    acciones.eliminarPlan(plan.id)
    showToast('Plan eliminado.', 'error')
  }

  return (
    <>
      <PageHeader
        kicker="Club"
        title="Planes"
        subtitle="Catálogo de planes de membresía, precios y beneficios."
        actions={
          <button className="btn-solid" onClick={abrirNuevo}>
            <i className="bi bi-plus-lg me-1"></i>Nuevo plan
          </button>
        }
      />

      {planes.length === 0 ? (
        <div className="card-flat">
          <EmptyState icon="bi-card-list">Aún no hay planes creados.</EmptyState>
        </div>
      ) : (
        <div className="row g-3">
          {planes.map((p) => {
            const activos = membresias.filter(
              (m) => m.planId === p.id && estadoMembresia(m) !== 'vencida',
            ).length
            return (
              <div className="col-md-6 col-xl-4" key={p.id}>
                <div className="card-flat p-3 h-100 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start">
                    <h3 className="mb-1">{p.nombre}</h3>
                    <span className="text-steel" style={{ fontSize: '0.78rem' }}>
                      {activos} activo(s)
                    </span>
                  </div>
                  <div className="scoreboard-num text-court" style={{ fontSize: '1.8rem' }}>
                    {formatMoney(p.precio)}
                    <span
                      className="text-steel"
                      style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem' }}
                    >
                      {' '}
                      / {p.duracionDias} días
                    </span>
                  </div>
                  <p className="text-steel flex-grow-1" style={{ fontSize: '0.88rem' }}>
                    {p.descripcion}
                  </p>
                  <div className="mb-3">
                    {(p.actividades || []).map((a) => (
                      <span
                        key={a}
                        className="badge-estado badge-activa me-1 mb-1"
                        style={{ display: 'inline-flex' }}
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                  <div className="d-flex gap-2 mt-auto">
                    <button
                      className="btn-outline-club flex-grow-1"
                      onClick={() => abrirEditar(p)}
                    >
                      <i className="bi bi-pencil me-1"></i>Editar
                    </button>
                    <button className="btn-outline-club text-alert" onClick={() => eliminar(p)}>
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
        title={editando ? 'Editar plan' : 'Nuevo plan'}
        footer={
          <>
            <button className="btn-outline-club" onClick={() => setModal(false)}>
              Cancelar
            </button>
            <button className="btn-solid" type="submit" form="form-plan">
              Guardar
            </button>
          </>
        }
      >
        <form id="form-plan" onSubmit={guardar}>
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
            <label className="form-label small fw-semibold text-steel">Descripción</label>
            <textarea
              className="form-control"
              rows="2"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            />
          </div>
          <div className="row">
            <div className="col-6 mb-3">
              <label className="form-label small fw-semibold text-steel">Precio (CLP)</label>
              <input
                type="number"
                className="form-control"
                value={form.precio}
                onChange={(e) => setForm({ ...form, precio: e.target.value })}
              />
            </div>
            <div className="col-6 mb-3">
              <label className="form-label small fw-semibold text-steel">Duración (días)</label>
              <input
                type="number"
                className="form-control"
                value={form.duracionDias}
                onChange={(e) => setForm({ ...form, duracionDias: e.target.value })}
              />
            </div>
          </div>
          <div className="mb-1">
            <label className="form-label small fw-semibold text-steel">
              Actividades (separadas por coma)
            </label>
            <input
              className="form-control"
              placeholder="Musculación, Funcional, Yoga"
              value={form.actividades}
              onChange={(e) => setForm({ ...form, actividades: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </>
  )
}
