document.addEventListener('DOMContentLoaded', () => {
  const membresias = getMembresias();

  const porVencer = membresias.filter(m => estadoMembresia(m) === 'por_vencer')
    .sort((a,b) => new Date(a.fechaFin) - new Date(b.fechaFin));
  const vencidas = membresias.filter(m => estadoMembresia(m) === 'vencida')
    .sort((a,b) => new Date(b.fechaFin) - new Date(a.fechaFin));

  document.getElementById('tabla-por-vencer').innerHTML = porVencer.map(m => {
    const socio = getSocioById(m.socioId);
    const plan = getPlanById(m.planId);
    return `<tr>
      <td>${esc(socio ? socio.nombre : m.socioId)}</td>
      <td>${esc(plan ? plan.nombre : m.planId)}</td>
      <td>${formatDateDisplay(m.fechaFin)}</td>
      <td>${diasRestantes(m)} día(s)</td>
      <td class="text-steel">${esc(socio ? socio.telefono || socio.email : '—')}</td>
    </tr>`;
  }).join('') || `<tr><td colspan="5" class="text-steel">Sin membresías próximas a vencer.</td></tr>`;

  document.getElementById('tabla-vencidas').innerHTML = vencidas.map(m => {
    const socio = getSocioById(m.socioId);
    const plan = getPlanById(m.planId);
    return `<tr>
      <td>${esc(socio ? socio.nombre : m.socioId)}</td>
      <td>${esc(plan ? plan.nombre : m.planId)}</td>
      <td>${formatDateDisplay(m.fechaFin)}</td>
      <td class="text-alert">${Math.abs(diasRestantes(m))} día(s)</td>
      <td class="text-steel">${esc(socio ? socio.telefono || socio.email : '—')}</td>
      <td class="text-end"><a href="membresias.html" class="btn-ghost-sm" title="Renovar en Membresías"><i class="bi bi-arrow-repeat"></i></a></td>
    </tr>`;
  }).join('') || `<tr><td colspan="6" class="text-steel">No hay membresías vencidas. 🎉</td></tr>`;

  const pendientes = getPagos().filter(p => p.estado === 'pendiente')
    .sort((a,b) => new Date(a.fecha) - new Date(b.fecha));

  document.getElementById('tabla-morosidad').innerHTML = pendientes.map(p => {
    const socio = getSocioById(p.socioId);
    return `<tr>
      <td>${esc(socio ? socio.nombre : p.socioId)}</td>
      <td>${formatMoney(p.monto)}</td>
      <td>${formatDateDisplay(p.fecha)}</td>
      <td class="text-steel">${esc(socio ? socio.telefono || socio.email : '—')}</td>
      <td class="text-end"><a href="pagos.html" class="btn-ghost-sm" title="Gestionar en Pagos"><i class="bi bi-cash-coin"></i></a></td>
    </tr>`;
  }).join('') || `<tr><td colspan="5" class="text-steel">No hay pagos pendientes. 🎉</td></tr>`;
});
