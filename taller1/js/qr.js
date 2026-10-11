let qrInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  const selectCredencial = document.getElementById('credencial-socio');
  const selectActividad = document.getElementById('scan-actividad');

  selectCredencial.innerHTML = getSocios().map(s => `<option value="${s.id}">${esc(s.nombre)}</option>`).join('');
  selectActividad.innerHTML = getActividades().map(a => `<option value="${a.id}">${esc(a.nombre)}</option>`).join('');

  selectCredencial.addEventListener('change', dibujarCredencial);
  dibujarCredencial();

  document.getElementById('form-scan').addEventListener('submit', validarEscaneo);

  // Accesos rápidos: botones que "simulan" escanear la credencial de un socio
  document.getElementById('accesos-rapidos').innerHTML = getSocios().slice(0, 5).map(s => `
    <button type="button" class="btn btn-outline-club btn-sm" onclick="simularEscaneo('${s.id}')">${esc(s.nombre.split(' ')[0])}</button>
  `).join('');
});

function dibujarCredencial(){
  const socioId = document.getElementById('credencial-socio').value;
  const contenedor = document.getElementById('qrcode-preview');
  contenedor.innerHTML = '';
  // eslint-disable-next-line no-undef
  new QRCode(contenedor, {
    text: socioId,
    width: 170,
    height: 170,
    colorDark: '#14181C',
    colorLight: '#ffffff'
  });
  document.getElementById('credencial-id').textContent = 'Código de la credencial: ' + socioId;
}

function simularEscaneo(socioId){
  document.getElementById('scan-input').value = socioId;
  validarEscaneo(new Event('submit'));
}

function validarEscaneo(e){
  if(e && e.preventDefault) e.preventDefault();

  const codigo = document.getElementById('scan-input').value.trim();
  const actividadId = document.getElementById('scan-actividad').value;
  const resultado = document.getElementById('scan-result');
  const socio = getSocioById(codigo);

  if(!socio){
    resultado.className = 'scan-result fail';
    resultado.innerHTML = `<strong><i class="bi bi-x-circle me-1"></i>Código no reconocido.</strong><br>
      No existe ningún socio con el código "${esc(codigo)}".`;
    return;
  }

  const mem = membresiaVigenteDe(socio.id);
  const estado = mem ? estadoMembresia(mem) : 'vencida';

  if(!mem || estado === 'vencida'){
    resultado.className = 'scan-result fail';
    resultado.innerHTML = `<strong><i class="bi bi-x-circle me-1"></i>Acceso denegado — ${esc(socio.nombre)}</strong><br>
      ${mem ? 'Membresía vencida el ' + formatDateDisplay(mem.fechaFin) + '.' : 'No tiene una membresía registrada.'}
      Debe regularizar su situación en <a href="vencimientos.html">Vencimientos</a>.`;
    return;
  }

  // Registrar check-in
  const asistencias = getAsistencias();
  asistencias.push({
    id: uid('AS'),
    socioId: socio.id,
    actividadId,
    fecha: today(),
    hora: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
    metodo: 'QR'
  });
  saveAll('asistencias', asistencias);

  const avisoPorVencer = estado === 'por_vencer'
    ? `<br><span class="text-alert">Su membresía vence en ${diasRestantes(mem)} día(s).</span>` : '';

  resultado.className = 'scan-result ok';
  resultado.innerHTML = `<strong><i class="bi bi-check-circle me-1"></i>Bienvenido/a, ${esc(socio.nombre)}</strong><br>
    Ingreso registrado a las ${new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}.${avisoPorVencer}`;

  showToast('Check-in registrado para ' + socio.nombre);
}
