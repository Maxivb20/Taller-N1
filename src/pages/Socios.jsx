import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useClub } from '../context/ClubContext'
import { useToast } from '../context/ToastContext'
import { estadoMembresia, membresiaVigenteDe } from '../utils/business'
import { formatDate } from '../utils/dates'
import PageHeader from '../components/ui/PageHeader'
import Modal from '../components/ui/Modal'
import EstadoBadge from '../components/ui/EstadoBadge'
import DataTable from '../components/ui/DataTable'

const VACIO = { nombre: '', email: '', telefono: '' }
const ESTADOS = [
  { key: '', label: 'Todos' },
  { key: 'activa', label: 'Activos' },
  { key: 'por_vencer', label: 'Por vencer' },
  { key: 'vencida', label: 'Vencidos' },
]

export default function Socios() {
  const { socios, planes, membresias, acciones } = useClub()
  const { showToast } = useToast()

  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState('')
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(VACIO)
  const [error, setError] = useState('')

  const planDe = (id) => planes.find((p) => p.id === id)

  const estadoDe = (socioId) => {
    const mem = membresiaVigenteDe(membresias, socioId)
    return mem ? estadoMembresia(mem) : 'vencida'
  }

  const lista = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return socios.filter((s) => {
      const coincide =
        !q ||
        s.nombre.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.telefono.toLowerCase().includes(q)
      const mem = membresiaVigenteDe(membresias, s.id)
      const estado = mem ? estadoMembresia(mem) : 'vencida'
      return coincide && (!filtro || estado === filtro)
    })
  }, [socios, membresias, busqueda, filtro])

  const abrirNuevo = () => {
    setEditando(null)
    setForm(VACIO)
    setError('')
    setModal(true)
  }

  const abrirEditar = (socio) => {
    setEditando(socio.id)
    setForm({ nombre: socio.nombre, email: socio.email, telefono: socio.telefono })
    setError('')
    setModal(true)
  }

  const guardar = (e) => {
    e.preventDefault()
    if (form.nombre.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError('Ingresa un correo electrónico válido.')
      return
    }
    if (form.telefono.trim().length < 8) {
      setError('Ingresa un teléfono de contacto válido.')
      return
    }
    const datos = {
      nombre: form.nombre.trim(),
      email: form.email.trim(),
      telefono: form.telefono.trim(),
    }
    if (editando) {
      acciones.editarSocio({ id: editando, ...datos })
      showToast('Socio actualizado.')
    } else {
      acciones.agregarSocio(datos)
      showToast('Socio registrado correctamente.')
    }
    setModal(false)
  }

  const eliminar = (socio) => {
    if (
      !window.confirm(
        `¿Eliminar a ${socio.nombre}? Se borrarán también sus membresías, pagos y asistencias.`,
      )
    )
      return
    acciones.eliminarSocio(socio.id)
    showToast('Socio eliminado.', 'error')
  }

  return (
    <>
      <PageHeader
        kicker="Club"
        title="Socios"
        subtitle="Padrón de socios con su estado de membresía actual."
        actions={
          <button className="btn-solid" onClick={abrirNuevo}>
            <i className="bi bi-person-plus me-1"></i>Nuevo socio
          </button>
        }
      />

      <div className="d-flex gap-2 flex-wrap align-items-center mb-3">
        <input
          className="form-control"
          style={{ maxWidth: 280 }}
          placeholder="Buscar por nombre, correo o teléfono…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        {ESTADOS.map((t) => (
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
            { key: 'contacto', label: 'Contacto' },
            { key: 'ingreso', label: 'Ingreso' },
            { key: 'plan', label: 'Plan vigente' },
            { key: 'vence', label: 'Vence' },
            { key: 'estado', label: 'Estado' },
            { key: 'acc', label: '', className: 'text-end' },
          ]}
          isEmpty={lista.length === 0}
          emptyIcon="bi-people"
          emptyText="No hay socios que coincidan con la búsqueda."
        >
          {lista.map((s) => {
            const mem = membresiaVigenteDe(membresias, s.id)
            return (
              <tr key={s.id}>
                <td>
                  <div className="fw-semibold">{s.nombre}</div>
                  <div className="text-steel" style={{ fontSize: '0.78rem' }}>
                    {s.email}
                  </div>
                </td>
                <td>{s.telefono}</td>
                <td>{formatDate(s.fechaIngreso)}</td>
                <td>{mem ? planDe(mem.planId)?.nombre || '—' : '—'}</td>
                <td>{mem ? formatDate(mem.fechaFin) : '—'}</td>
                <td>
                  <EstadoBadge estado={estadoDe(s.id)} />
                </td>
                <td className="text-end">
                  <div className="d-inline-flex gap-1">
                    <Link
                      to={`/socios/${s.id}`}
                      className="btn-ghost-sm"
                      title="Ver historial"
                    >
                      <i className="bi bi-clock-history"></i>
                    </Link>
                    <button
                      className="btn-ghost-sm"
                      title="Editar"
                      onClick={() => abrirEditar(s)}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className="btn-ghost-sm text-alert"
                      title="Eliminar"
                      onClick={() => eliminar(s)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </DataTable>
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editando ? 'Editar socio' : 'Nuevo socio'}
        footer={
          <>
            <button className="btn-outline-club" onClick={() => setModal(false)}>
              Cancelar
            </button>
            <button className="btn-solid" type="submit" form="form-socio">
              Guardar
            </button>
          </>
        }
      >
        <form id="form-socio" onSubmit={guardar}>
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
            <label className="form-label small fw-semibold text-steel">Correo electrónico</label>
            <input
              type="email"
              className="form-control"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="mb-1">
            <label className="form-label small fw-semibold text-steel">Teléfono</label>
            <input
              className="form-control"
              placeholder="+56 9 ..."
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </>
  )
}
