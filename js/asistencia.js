document.addEventListener('DOMContentLoaded', () => {
  const selectSocio = document.getElementById('checkin-socio');
  const selectActividad = document.getElementById('checkin-actividad');

  selectSocio.innerHTML = getSocios().map(s => `<option value="${s.id}">${esc(s.nombre)}</option>`).join('');
  selectActividad.innerHTML = getActividades().map(a => `<option value="${a.id}">${esc(a.nombre)}</option>`).join('');

  selectSocio.addEventListener('change', validarVigenciaSocio);
  validarVigenciaSocio();

  document.getElementById('form-checkin').addEventListener('submit', registrarCheckinManual);

  const filtroFecha = document.getElementById('filtro-fecha');
  filtroFecha.value = today();
  filtroFecha.addEventListener('change', renderAsistencia);
  renderAsistencia();
});

function validarVigenciaSocio(){
  const socioId = document.getElementById('checkin-socio').value;
  const mem = membresiaVigenteDe(socioId);
  const alerta = document.getElementById('checkin-alerta');
  const btnSubmit = document.querySelector('#form-checkin button[type=submit]');

  if(!mem){
    alerta.style.display = 'block';
    alerta.innerHTML = `<div class="scan-result fail" style="display:block; padding:10px 12px; font-size:0.85rem;">Este socio no tiene una membresía registrada.</div>`;
    btnSubmit.disabled = true;
    return;
  }

  const estado = estadoMembresia(mem);
  if(estado === 'vencida'){
    alerta.style.display = 'block';
    alerta.innerHTML = `<div class="scan-result fail" style="display:block; padding:10px 12px; font-size:0.85rem;">Membresía vencida el ${formatDateDisplay(mem.fechaFin)}. No se puede registrar el ingreso.</div>`;
    btnSubmit.disabled = true;
  } else if(estado === 'por_vencer'){
    alerta.style.display = 'block';
    alerta.innerHTML = `<div class="scan-result ok" style="display:block; padding:10px 12px; font-size:0.85rem;">Membresía vigente, pero vence en ${diasRestantes(mem)} día(s).</div>`;
    btnSubmit.disabled = false;
  } else {
    alerta.style.display = 'none';
    btnSubmit.disabled = false;
  }
}

function registrarCheckinManual(e){
  e.preventDefault();
  const socioId = document.getElementById('checkin-socio').value;
  const actividadId = document.getElementById('checkin-actividad').value;

  const asistencias = getAsistencias();
  asistencias.push({
    id: uid('AS'),
    socioId, actividadId,
    fecha: today(),
    hora: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
    metodo: 'Manual'
  });
  saveAll('asistencias', asistencias);
  showToast('Asistencia registrada.');
  renderAsistencia();
}

function renderAsistencia(){
  const fecha = document.getElementById('filtro-fecha').value;
  const asistencias = getAsistencias().filter(a => !fecha || a.fecha === fecha)
    .sort((a,b) => b.hora.localeCompare(a.hora));

  document.getElementById('tabla-asistencia').innerHTML = asistencias.map(a => {
    const socio = getSocioById(a.socioId);
    const act = getActividadById(a.actividadId);
    return `<tr>
      <td>${esc(socio ? socio.nombre : a.socioId)}</td>
      <td>${esc(act ? act.nombre : '—')}</td>
      <td>${esc(a.hora)}</td>
      <td>${esc(a.metodo)}</td>
    </tr>`;
  }).join('') || `<tr><td colspan="4" class="text-steel">Sin registros para esta fecha.</td></tr>`;
}
