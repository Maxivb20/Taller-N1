let modalMembresiaInstance;
let filtroEstadoActual = '';

document.addEventListener('DOMContentLoaded', () => {
  modalMembresiaInstance = new bootstrap.Modal(document.getElementById('modalMembresia'));
  renderMembresias();

  document.querySelectorAll('#tabs-estado .nav-link').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#tabs-estado .nav-link').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filtroEstadoActual = btn.dataset.estado;
      renderMembresias();
    });
  });

  document.getElementById('form-membresia').addEventListener('submit', registrarMembresia);
  document.getElementById('mem-plan').addEventListener('change', actualizarPreview);
  document.getElementById('mem-inicio').addEventListener('change', actualizarPreview);
});

function renderMembresias(){
  let membresias = [...getMembresias()].sort((a,b) => new Date(a.fechaFin) - new Date(b.fechaFin));
  if(filtroEstadoActual){
    membresias = membresias.filter(m => estadoMembresia(m) === filtroEstadoActual);
  }

  const tbody = document.getElementById('tabla-membresias');
  const empty = document.getElementById('membresias-empty');

  if(membresias.length === 0){
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  tbody.innerHTML = membresias.map(m => {
    const socio = getSocioById(m.socioId);
    const plan = getPlanById(m.planId);
    const restantes = diasRestantes(m);
    const estado = estadoMembresia(m);
    return `<tr>
      <td>${esc(socio ? socio.nombre : m.socioId)}</td>
      <td>${esc(plan ? plan.nombre : m.planId)}</td>
      <td>${formatDateDisplay(m.fechaInicio)}</td>
      <td>${formatDateDisplay(m.fechaFin)}</td>
      <td>${restantes >= 0 ? restantes + ' día(s)' : `<span class="text-alert">${Math.abs(restantes)} día(s) vencida</span>`}</td>
      <td>${badgeEstadoHtml(estado)}</td>
      <td class="text-end">
        <button class="btn-ghost-sm" onclick="renovarMembresia('${m.id}')" title="Renovar"><i class="bi bi-arrow-repeat"></i></button>
      </td>
    </tr>`;
  }).join('');
}

function abrirNuevaMembresia(){
  const selectSocio = document.getElementById('mem-socio');
  const selectPlan = document.getElementById('mem-plan');
  selectSocio.innerHTML = getSocios().map(s => `<option value="${s.id}">${esc(s.nombre)}</option>`).join('');
  selectPlan.innerHTML = getPlanes().map(p => `<option value="${p.id}">${esc(p.nombre)} — ${formatMoney(p.precio)}</option>`).join('');
  document.getElementById('mem-inicio').value = today();
  actualizarPreview();
  modalMembresiaInstance.show();
}

function actualizarPreview(){
  const planId = document.getElementById('mem-plan').value;
  const inicio = document.getElementById('mem-inicio').value;
  const plan = getPlanById(planId);
  if(!plan || !inicio) return;
  const fin = addDays(inicio, plan.duracionDias);
  document.getElementById('mem-preview').textContent =
    `Vigencia: ${formatDateDisplay(inicio)} → ${formatDateDisplay(fin)} (${plan.duracionDias} días). Se generará un pago pendiente por ${formatMoney(plan.precio)}.`;
}

function registrarMembresia(e){
  e.preventDefault();
  const socioId = document.getElementById('mem-socio').value;
  const planId = document.getElementById('mem-plan').value;
  const inicio = document.getElementById('mem-inicio').value;
  const plan = getPlanById(planId);
  const fin = addDays(inicio, plan.duracionDias);

  const membresias = getMembresias();
  const nuevaId = uid('M');
  membresias.push({ id: nuevaId, socioId, planId, fechaInicio: inicio, fechaFin: fin, actividadPreferida: (plan.actividades && plan.actividades[0]) ? getActividades().find(a=>a.nombre===plan.actividades[0])?.id : null });
  saveAll('membresias', membresias);

  const pagos = getPagos();
  pagos.push({ id: uid('PG'), socioId, membresiaId: nuevaId, monto: plan.precio, fecha: inicio, metodo: '—', estado: 'pendiente' });
  saveAll('pagos', pagos);

  showToast('Membresía registrada. Se generó un pago pendiente.');
  modalMembresiaInstance.hide();
  renderMembresias();
}

function renovarMembresia(id){
  const mem = getMembresias().find(m => m.id === id);
  if(!mem) return;
  const plan = getPlanById(mem.planId);
  if(!confirmAction(`¿Renovar la membresía de ${getSocioById(mem.socioId)?.nombre} por ${plan.duracionDias} días más?`)) return;

  const membresias = getMembresias();
  const nuevaId = uid('M');
  const inicio = today();
  const fin = addDays(inicio, plan.duracionDias);
  membresias.push({ id: nuevaId, socioId: mem.socioId, planId: mem.planId, fechaInicio: inicio, fechaFin: fin, actividadPreferida: mem.actividadPreferida });
  saveAll('membresias', membresias);

  const pagos = getPagos();
  pagos.push({ id: uid('PG'), socioId: mem.socioId, membresiaId: nuevaId, monto: plan.precio, fecha: inicio, metodo: '—', estado: 'pendiente' });
  saveAll('pagos', pagos);

  showToast('Membresía renovada correctamente.');
  renderMembresias();
}
