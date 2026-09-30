import { useState } from 'react';

export default function Socios({ socios, onAgregar }) {
  const [nombre, setNombre] = useState('');
  const [plan, setPlan] = useState('Mensual Estándar');
  const [errorForm, setErrorForm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validación estricta del formulario controlled requerida por la pauta
    if (nombre.trim().length < 3) {
      setErrorForm('El nombre del socio debe tener al menos 3 caracteres.');
      return;
    }
    
    setErrorForm('');
    
    // Lógica mutadora simulada pasando los datos al componente superior
    onAgregar({ 
      nombre: nombre.trim(), 
      plan: plan, 
      estado: "Activa", 
      vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Vence en 30 días
    });
    
    // Limpieza de estados del formulario
    setNombre(''); 
  };

  return (
    <div className="p-2">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">👥 Módulo de Socios</h2>
        <p className="text-muted mb-0">Gestión de inscripciones, membresías y validación de registros del club.</p>
      </div>

      <div className="row g-4">
        {/* Formulario Controlado de Alta */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm p-4">
            <h5 className="fw-bold mb-3 text-dark">Registrar Nuevo Miembro</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Nombre Completo</label>
                <input 
                  type="text" 
                  className={`form-control ${errorForm ? 'is-invalid' : ''}`}
                  placeholder="Ej: Juan Pérez"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
                {errorForm && <div className="invalid-feedback fw-semibold">{errorForm}</div>}
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-muted">Plan Seleccionado</label>
                <select 
                  className="form-select" 
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                >
                  <option value="Mensual Estándar">Mensual Estándar</option>
                  <option value="Mensual Full">Mensual Full</option>
                  <option value="Anual Corporativo">Anual Corporativo</option>
                </select>
              </div>

              <button className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2" type="submit">
                <i className="bi bi-person-plus-fill"></i> Inscribir Socio
              </button>
            </form>
          </div>
        </div>

        {/* Tabla Dinámica de Visualización */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3 border-0">
              <h5 className="fw-bold mb-0 text-dark">Listado de Miembros Activos</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead className="table-light text-muted small text-uppercase">
                    <tr>
                      <th className="px-4">Socio</th>
                      <th>Plan contratado</th>
                      <th>Fecha Vencimiento</th>
                      <th className="pe-4 text-end">Membresía</th>
                    </tr>
                  </thead>
                  <tbody>
                    {socios.map((socio) => (
                      <tr key={socio.id}>
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center gap-2">
                            <div className="avatar bg-light text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '35px', height: '35px' }}>
                              <i className="bi bi-person-fill"></i>
                            </div>
                            <span className="fw-semibold text-dark">{socio.nombre}</span>
                          </div>
                        </td>
                        <td>{socio.plan}</td>
                        <td className="text-muted small">{socio.vencimiento}</td>
                        <td className="pe-4 text-end">
                          <span className={`badge px-2 py-1.5 rounded-pill bg-${socio.estado === 'Activa' ? 'success' : 'danger'} bg-opacity-10 text-${socio.estado === 'Activa' ? 'success' : 'danger'}`}>
                            <i className={`bi bi-circle-fill me-1 small ${socio.estado === 'Activa' ? 'text-success' : 'text-danger'}`}></i>
                            {socio.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
