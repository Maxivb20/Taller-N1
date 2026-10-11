let modalPlanInstance;

document.addEventListener('DOMContentLoaded', () => {
  modalPlanInstance = new bootstrap.Modal(document.getElementById('modalPlan'));
  renderPlanes();
  document.getElementById('form-plan').addEventListener('submit', guardarPlan);
});

function renderPlanes(){
  const planes = getPlanes();
  const membresias = getMembresias();

  document.getElementById('grid-planes').innerHTML = planes.map(p => {
    const activosDelPlan = membresias.filter(m => m.planId === p.id && estadoMembresia(m) !== 'vencida').length;
    return `
      <div class="col-md-6 col-xl-4">
        <div class="card-flat p-3 h-100 d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start">
            <h3 class="mb-1">${esc(p.nombre)}</h3>
            <span class="text-steel" style="font-size:0.8rem;">${activosDelPlan} socio(s) activos</span>
          </div>
          <div class="scoreboard-num text-court" style="font-size:1.8rem;">${formatMoney(p.precio)}<span class="text-steel" style="font-family:'Inter';font-size:0.8rem;"> / ${p.duracionDias} días</span></div>
          <p class="text-steel flex-grow-1" style="font-size:0.88rem;">${esc(p.descripcion || '')}</p>
          <div class="mb-2">
            ${(p.actividades || []).map(a => `<span class="badge-estado badge-activa me-1 mb-1" style="display:inline-flex;">${esc(a)}</span>`).join('')}
          </div>
          <div class="d-flex gap-2 mt-auto">
            <button class="btn btn-outline-club btn-sm flex-grow-1" onclick="abrirEditarPlan('${p.id}')"><i class="bi bi-pencil me-1"></i>Editar</button>
            <button class="btn btn-outline-club btn-sm text-alert" onclick="eliminarPlan('${p.id}')"><i class="bi bi-trash"></i></button>
          </div>
        </div>
      </div>`;
  }).join('') || `<div class="empty-state"><i class="bi bi-card-list"></i>Aún no hay planes creados.</div>`;
}

function abrirNuevoPlan(){
  document.getElementById('modalPlanTitulo').textContent = 'Nuevo plan';
  document.getElementById('form-plan').reset();
  document.getElementById('plan-id').value = '';
  modalPlanInstance.show();
}

function abrirEditarPlan(id){
  const p = getPlanById(id);
  if(!p) return;
  document.getElementById('modalPlanTitulo').textContent = 'Editar plan';
  document.getElementById('plan-id').value = p.id;
  document.getElementById('plan-nombre').value = p.nombre;
  document.getElementById('plan-descripcion').value = p.descripcion || '';
  document.getElementById('plan-precio').value = p.precio;
  document.getElementById('plan-duracion').value = p.duracionDias;
  document.getElementById('plan-actividades').value = (p.actividades || []).join(', ');
  modalPlanInstance.show();
}

function guardarPlan(e){
  e.preventDefault();
  const id = document.getElementById('plan-id').value;
  const nombre = document.getElementById('plan-nombre').value.trim();
  const descripcion = document.getElementById('plan-descripcion').value.trim();
  const precio = Number(document.getElementById('plan-precio').value);
  const duracionDias = Number(document.getElementById('plan-duracion').value);
  const actividades = document.getElementById('plan-actividades').value
    .split(',').map(s => s.trim()).filter(Boolean);

  const planes = getPlanes();
  if(id){
    const idx = planes.findIndex(p => p.id === id);
    planes[idx] = { ...planes[idx], nombre, descripcion, precio, duracionDias, actividades };
    showToast('Plan actualizado.');
  } else {
    planes.push({ id: uid('P'), nombre, descripcion, precio, duracionDias, actividades });
    showToast('Plan creado correctamente.');
  }
  saveAll('planes', planes);
  modalPlanInstance.hide();
  renderPlanes();
}

function eliminarPlan(id){
  const enUso = getMembresias().some(m => m.planId === id);
  if(enUso){
    showToast('No se puede eliminar: hay membresías asociadas a este plan.', 'error');
    return;
  }
  if(!confirmAction('¿Eliminar este plan?')) return;
  saveAll('planes', getPlanes().filter(p => p.id !== id));
  showToast('Plan eliminado.', 'error');
  renderPlanes();
}
