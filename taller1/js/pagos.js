let modalPagoInstance;

document.addEventListener('DOMContentLoaded', () => {
  modalPagoInstance = new bootstrap.Modal(document.getElementById('modalPago'));
  renderPagos();
  document.getElementById('filtro-pago-estado').addEventListener('change', renderPagos);
  document.getElementById('form-pago').addEventListener('submit', registrarPago);
  document.getElementById('pago-socio').addEventListener('change', cargarMembresiasDeSocio);
});

function renderPagos(){
  const filtro = document.getElementById('filtro-pago-estado').value;
  let pagos = [...getPagos()].sort((a,b) => new Date(b.fecha) - new Date(a.fecha));
  if(filtro) pagos = pagos.filter(p => p.estado === filtro);

  document.getElementById('tabla-pagos').innerHTML = pagos.map(p => {
    const socio = getSocioById(p.socioId);
    return `<tr>
      <td>${esc(socio ? socio.nombre : p.socioId)}</td>
      <td>${formatDateDisplay(p.fecha)}</td>
      <td>${formatMoney(p.monto)}</td>
      <td>${esc(p.metodo)}</td>
      <td>${badgeEstadoHtml(p.estado)}</td>
      <td class="text-end">
        ${p.estado === 'pendiente' ? `<button class="btn-ghost-sm text-court" onclick="marcarPagado('${p.id}')" title="Marcar como pagado"><i class="bi bi-check2-circle"></i></button>` : ''}
      </td>
    </tr>`;
  }).join('') || `<tr><td colspan="6" class="text-steel">Sin pagos para este filtro.</td></tr>`;

  // Estadísticas
  const todos = getPagos();
  const mesActual = today().slice(0,7);
  const recaudado = todos.filter(p => p.estado === 'pagado' && p.fecha.slice(0,7) === mesActual).reduce((s,p)=>s+p.monto,0);
  const pendiente = todos.filter(p => p.estado === 'pendiente').reduce((s,p)=>s+p.monto,0);
  document.getElementById('stat-recaudado').textContent = formatMoney(recaudado);
  document.getElementById('stat-pendiente').textContent = formatMoney(pendiente);
  document.getElementById('stat-total-pagos').textContent = todos.length;
}

function abrirNuevoPago(){
  const selectSocio = document.getElementById('pago-socio');
  selectSocio.innerHTML = getSocios().map(s => `<option value="${s.id}">${esc(s.nombre)}</option>`).join('');
  cargarMembresiasDeSocio();
  modalPagoInstance.show();
}

function cargarMembresiasDeSocio(){
  const socioId = document.getElementById('pago-socio').value;
  const selectMem = document.getElementById('pago-membresia');
  const mems = getMembresias().filter(m => m.socioId === socioId);
  selectMem.innerHTML = mems.map(m => {
    const plan = getPlanById(m.planId);
    return `<option value="${m.id}" data-precio="${plan ? plan.precio : 0}">${esc(plan ? plan.nombre : m.planId)} (vence ${formatDateDisplay(m.fechaFin)})</option>`;
  }).join('');
  if(mems.length){
    const plan = getPlanById(mems[0].planId);
    document.getElementById('pago-monto').value = plan ? plan.precio : '';
  }
}

function registrarPago(e){
  e.preventDefault();
  const socioId = document.getElementById('pago-socio').value;
  const membresiaId = document.getElementById('pago-membresia').value;
  const monto = Number(document.getElementById('pago-monto').value);
  const metodo = document.getElementById('pago-metodo').value;

  const pagos = getPagos();
  pagos.push({ id: uid('PG'), socioId, membresiaId, monto, fecha: today(), metodo, estado: 'pagado' });
  saveAll('pagos', pagos);

  showToast('Pago registrado correctamente.');
  modalPagoInstance.hide();
  renderPagos();
}

function marcarPagado(id){
  const pagos = getPagos();
  const idx = pagos.findIndex(p => p.id === id);
  if(idx === -1) return;
  pagos[idx].estado = 'pagado';
  pagos[idx].metodo = pagos[idx].metodo === '—' ? 'Efectivo' : pagos[idx].metodo;
  saveAll('pagos', pagos);
  showToast('Pago marcado como pagado.');
  renderPagos();
}
