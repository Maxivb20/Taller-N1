let modalActividadInstance;

document.addEventListener('DOMContentLoaded', () => {
  modalActividadInstance = new bootstrap.Modal(document.getElementById('modalActividad'));
  renderActividades();
  document.getElementById('form-actividad').addEventListener('submit', guardarActividad);
});

function renderActividades(){
  const actividades = getActividades();
  const asistencias = getAsistencias();
  const membresias = getMembresias();

  document.getElementById('grid-actividades').innerHTML = actividades.map(a => {
    const inscritos = membresias.filter(m => m.actividadPreferida === a.id && estadoMembresia(m) !== 'vencida').length;
    const asistHoy = asistencias.filter(x => x.actividadId === a.id && x.fecha === today()).length;
    const pct = Math.min(100, Math.round((inscritos / a.cupo) * 100));
    return `
      <div class="col-md-6 col-xl-4">
        <div class="card-flat p-3 h-100 d-flex flex-column">
          <h3 class="mb-0">${esc(a.nombre)}</h3>
          <p class="text-steel mb-2" style="font-size:0.85rem;">${esc(a.instructor || 'Sin instructor asignado')}</p>
          <p style="font-size:0.85rem;"><i class="bi bi-clock text-steel"></i> ${esc(a.horario || '—')}</p>
          <div class="d-flex justify-content-between" style="font-size:0.82rem;">
            <span>Ocupación</span><span class="text-steel">${inscritos}/${a.cupo}</span>
          </div>
          <div class="bar-track mb-2"><div class="bar-fill" style="width:${pct}%;"></div></div>
          <p class="text-steel mb-3" style="font-size:0.8rem;">${asistHoy} check-in(s) hoy</p>
          <div class="d-flex gap-2 mt-auto">
            <button class="btn btn-outline-club btn-sm flex-grow-1" onclick="abrirEditarActividad('${a.id}')"><i class="bi bi-pencil me-1"></i>Editar</button>
            <button class="btn btn-outline-club btn-sm text-alert" onclick="eliminarActividad('${a.id}')"><i class="bi bi-trash"></i></button>
          </div>
        </div>
      </div>`;
  }).join('') || `<div class="empty-state"><i class="bi bi-calendar-week"></i>No hay actividades registradas.</div>`;
}

function abrirNuevaActividad(){
  document.getElementById('modalActividadTitulo').textContent = 'Nueva actividad';
  document.getElementById('form-actividad').reset();
  document.getElementById('actividad-id').value = '';
  modalActividadInstance.show();
}

function abrirEditarActividad(id){
  const a = getActividadById(id);
  if(!a) return;
  document.getElementById('modalActividadTitulo').textContent = 'Editar actividad';
  document.getElementById('actividad-id').value = a.id;
  document.getElementById('actividad-nombre').value = a.nombre;
  document.getElementById('actividad-instructor').value = a.instructor || '';
  document.getElementById('actividad-horario').value = a.horario || '';
  document.getElementById('actividad-cupo').value = a.cupo;
  modalActividadInstance.show();
}

function guardarActividad(e){
  e.preventDefault();
  const id = document.getElementById('actividad-id').value;
  const nombre = document.getElementById('actividad-nombre').value.trim();
  const instructor = document.getElementById('actividad-instructor').value.trim();
  const horario = document.getElementById('actividad-horario').value.trim();
  const cupo = Number(document.getElementById('actividad-cupo').value);

  const actividades = getActividades();
  if(id){
    const idx = actividades.findIndex(a => a.id === id);
    actividades[idx] = { ...actividades[idx], nombre, instructor, horario, cupo };
    showToast('Actividad actualizada.');
  } else {
    actividades.push({ id: uid('A'), nombre, instructor, horario, cupo });
    showToast('Actividad creada.');
  }
  saveAll('actividades', actividades);
  modalActividadInstance.hide();
  renderActividades();
}

function eliminarActividad(id){
  if(!confirmAction('¿Eliminar esta actividad?')) return;
  saveAll('actividades', getActividades().filter(a => a.id !== id));
  showToast('Actividad eliminada.', 'error');
  renderActividades();
}
