let modalSocioInstance;

document.addEventListener('DOMContentLoaded', () => {
  modalSocioInstance = new bootstrap.Modal(document.getElementById('modalSocio'));
  renderSocios();
  document.getElementById('buscar-socio').addEventListener('input', renderSocios);
  document.getElementById('form-socio').addEventListener('submit', guardarSocio);
});

function renderSocios(){
  const texto = document.getElementById('buscar-socio').value.trim().toLowerCase();
  const filtroEstado = document.getElementById('filtro-estado').value;

  const socios = getSocios().filter(s =>
    s.nombre.toLowerCase().includes(texto) || s.email.toLowerCase().includes(texto)
  );

  const filas = socios.map(s => {
    const mem = membresiaVigenteDe(s.id);
    const estado = mem ? estadoMembresia(mem) : 'vencida';
    const plan = mem ? getPlanById(mem.planId) : null;
    return { socio: s, mem, estado, plan };
  }).filter(row => !filtroEstado || row.estado === filtroEstado);

  const tbody = document.getElementById('tabla-socios');
  const empty = document.getElementById('socios-empty');

  if(filas.length === 0){
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  tbody.innerHTML = filas.map(({ socio, mem, estado, plan }) => `
    <tr>
      <td>
        <div style="font-weight:600;">${esc(socio.nombre)}</div>
        <div class="text-steel" style="font-size:0.78rem;">${esc(socio.id)}</div>
      </td>
      <td>
        <div>${esc(socio.email)}</div>
        <div class="text-steel" style="font-size:0.78rem;">${esc(socio.telefono || '—')}</div>
      </td>
      <td>${formatDateDisplay(socio.fechaIngreso)}</td>
      <td>${plan ? esc(plan.nombre) : '<span class="text-steel">Sin plan</span>'}</td>
      <td>${badgeEstadoHtml(estado)}</td>
      <td>${mem ? formatDateDisplay(mem.fechaFin) : '—'}</td>
      <td class="text-end">
        <a href="socio-historial.html?id=${encodeURIComponent(socio.id)}" class="btn-ghost-sm" title="Historial"><i class="bi bi-clock-history"></i></a>
        <button class="btn-ghost-sm" title="Editar" onclick="abrirEditarSocio('${socio.id}')"><i class="bi bi-pencil"></i></button>
        <button class="btn-ghost-sm text-alert" title="Eliminar" onclick="eliminarSocio('${socio.id}')"><i class="bi bi-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

function abrirNuevoSocio(){
  document.getElementById('modalSocioTitulo').textContent = 'Nuevo socio';
  document.getElementById('form-socio').reset();
  document.getElementById('socio-id').value = '';
}

function abrirEditarSocio(id){
  const s = getSocioById(id);
  if(!s) return;
  document.getElementById('modalSocioTitulo').textContent = 'Editar socio';
  document.getElementById('socio-id').value = s.id;
  document.getElementById('socio-nombre').value = s.nombre;
  document.getElementById('socio-email').value = s.email;
  document.getElementById('socio-telefono').value = s.telefono || '';
  modalSocioInstance.show();
}

function guardarSocio(e){
  e.preventDefault();
  const id = document.getElementById('socio-id').value;
  const nombre = document.getElementById('socio-nombre').value.trim();
  const email = document.getElementById('socio-email').value.trim();
  const telefono = document.getElementById('socio-telefono').value.trim();

  const socios = getSocios();

  if(id){
    const idx = socios.findIndex(s => s.id === id);
    socios[idx] = { ...socios[idx], nombre, email, telefono };
    showToast('Datos del socio actualizados.');
  } else {
    const nuevoId = uid('S');
    socios.push({ id: nuevoId, nombre, email, telefono, fechaIngreso: today() });
    showToast('Socio agregado correctamente.');
  }

  saveAll('socios', socios);
  modalSocioInstance.hide();
  renderSocios();
}

function eliminarSocio(id){
  if(!confirmAction('¿Eliminar este socio y sus registros asociados? Esta acción no se puede deshacer.')) return;

  saveAll('socios', getSocios().filter(s => s.id !== id));
  saveAll('membresias', getMembresias().filter(m => m.socioId !== id));
  saveAll('pagos', getPagos().filter(p => p.socioId !== id));
  saveAll('asistencias', getAsistencias().filter(a => a.socioId !== id));

  showToast('Socio eliminado.', 'error');
  renderSocios();
}
