document.addEventListener('DOMContentLoaded', () => {
  const id = getQueryParam('id');
  const socio = getSocioById(id);

  if(!socio){
    document.getElementById('ficha-socio').innerHTML = `
      <div class="empty-state"><i class="bi bi-person-x"></i>No se encontró el socio solicitado.</div>`;
    return;
  }

  const memActual = membresiaVigenteDe(socio.id);
  const estado = memActual ? estadoMembresia(memActual) : 'vencida';
  const plan = memActual ? getPlanById(memActual.planId) : null;

  document.getElementById('ficha-socio').innerHTML = `
    <div class="card-flat p-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
      <div>
        <div class="kicker">Ficha del socio</div>
        <h1 class="mb-1">${esc(socio.nombre)}</h1>
        <p class="text-steel mb-0">${esc(socio.email)} · ${esc(socio.telefono || 'sin teléfono')}</p>
        <p class="text-steel mb-0" style="font-size:0.82rem;">Socio desde ${formatDateDisplay(socio.fechaIngreso)} · ID ${esc(socio.id)}</p>
      </div>
      <div class="text-end">
        ${badgeEstadoHtml(estado)}
        <div class="mt-2" style="font-size:0.85rem;">
          Plan actual: <strong>${plan ? esc(plan.nombre) : '—'}</strong><br>
          ${memActual ? 'Vence el ' + formatDateDisplay(memActual.fechaFin) : ''}
        </div>
      </div>
    </div>
  `;

  const membresias = getMembresias().filter(m => m.socioId === id).sort((a,b) => new Date(b.fechaInicio) - new Date(a.fechaInicio));
  document.getElementById('tabla-hist-membresias').innerHTML = membresias.map(m => {
    const p = getPlanById(m.planId);
    return `<tr>
      <td>${esc(p ? p.nombre : m.planId)}</td>
      <td>${formatDateDisplay(m.fechaInicio)}</td>
      <td>${formatDateDisplay(m.fechaFin)}</td>
      <td>${badgeEstadoHtml(estadoMembresia(m))}</td>
    </tr>`;
  }).join('') || `<tr><td colspan="4" class="text-steel">Sin membresías registradas.</td></tr>`;

  const pagos = getPagos().filter(p => p.socioId === id).sort((a,b) => new Date(b.fecha) - new Date(a.fecha));
  document.getElementById('tabla-hist-pagos').innerHTML = pagos.map(p => `
    <tr>
      <td>${formatDateDisplay(p.fecha)}</td>
      <td>${formatMoney(p.monto)}</td>
      <td>${esc(p.metodo)}</td>
      <td>${badgeEstadoHtml(p.estado)}</td>
    </tr>`).join('') || `<tr><td colspan="4" class="text-steel">Sin pagos registrados.</td></tr>`;

  const asistencias = getAsistencias().filter(a => a.socioId === id).sort((a,b) => (b.fecha+b.hora).localeCompare(a.fecha+a.hora));
  document.getElementById('tabla-hist-asistencia').innerHTML = asistencias.map(a => {
    const act = getActividadById(a.actividadId);
    return `<tr>
      <td>${formatDateDisplay(a.fecha)}</td>
      <td>${esc(a.hora)}</td>
      <td>${esc(act ? act.nombre : '—')}</td>
      <td>${esc(a.metodo)}</td>
    </tr>`;
  }).join('') || `<tr><td colspan="4" class="text-steel">Sin asistencias registradas.</td></tr>`;
});
