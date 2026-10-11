document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('hoy-label').textContent = formatDateDisplay(today());

  const socios = getSocios();
  const membresias = getMembresias();
  const pagos = getPagos();
  const asistencias = getAsistencias();

  // --- Estados de membresía ---
  const conteo = { activa: 0, por_vencer: 0, vencida: 0 };
  const ultimaPorSocio = {};
  membresias.forEach(m => {
    // nos quedamos con la membresía de fecha_fin más reciente por socio
    if(!ultimaPorSocio[m.socioId] || new Date(m.fechaFin) > new Date(ultimaPorSocio[m.socioId].fechaFin)){
      ultimaPorSocio[m.socioId] = m;
    }
  });
  Object.values(ultimaPorSocio).forEach(m => { conteo[estadoMembresia(m)]++; });

  document.getElementById('stat-activos').textContent = conteo.activa;
  document.getElementById('stat-total-socios').textContent = socios.length;
  document.getElementById('stat-por-vencer').textContent = conteo.por_vencer;

  // --- Morosidad ---
  const pendientes = pagos.filter(p => p.estado === 'pendiente');
  const totalMoroso = pendientes.reduce((sum, p) => sum + p.monto, 0);
  document.getElementById('stat-morosidad').textContent = formatMoney(totalMoroso);
  document.getElementById('stat-morosidad-sub').textContent = pendientes.length + ' pago(s) pendiente(s)';

  // --- Check-ins hoy ---
  const hoy = today();
  const checkinsHoy = asistencias.filter(a => a.fecha === hoy);
  document.getElementById('stat-checkins-hoy').textContent = checkinsHoy.length;

  // --- Barras de distribución de estado ---
  const totalMem = conteo.activa + conteo.por_vencer + conteo.vencida || 1;
  const barras = [
    { label: 'Activa', n: conteo.activa, color: 'var(--court)' },
    { label: 'Por vencer', n: conteo.por_vencer, color: 'var(--amber)' },
    { label: 'Vencida', n: conteo.vencida, color: 'var(--alert)' },
  ];
  document.getElementById('estado-bars').innerHTML = barras.map(b => `
    <div class="mb-3">
      <div class="d-flex justify-content-between" style="font-size:0.85rem;">
        <span>${b.label}</span><span class="text-steel">${b.n}</span>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:${(b.n/totalMem*100).toFixed(0)}%; background:${b.color};"></div></div>
    </div>
  `).join('');

  // --- Gráfico de asistencia (7 días) ---
  const dias = [];
  const valores = [];
  for(let offset = 6; offset >= 0; offset--){
    const f = addDays(hoy, -offset);
    dias.push(new Date(f + 'T00:00:00').toLocaleDateString('es-CL', { weekday: 'short' }));
    valores.push(asistencias.filter(a => a.fecha === f).length);
  }
  new Chart(document.getElementById('chart-asistencia'), {
    type: 'bar',
    data: {
      labels: dias,
      datasets: [{ data: valores, backgroundColor: '#2F6844', borderRadius: 3, maxBarThickness: 36 }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#E8E3D6' } },
        x: { grid: { display: false } }
      }
    }
  });

  // --- Últimos check-ins ---
  const ultimos = [...asistencias].sort((a, b) => (b.fecha + b.hora).localeCompare(a.fecha + a.hora)).slice(0, 6);
  document.getElementById('tabla-ultimos-checkins').innerHTML = ultimos.map(a => {
    const socio = getSocioById(a.socioId);
    const act = getActividadById(a.actividadId);
    return `<tr>
      <td>${esc(socio ? socio.nombre : a.socioId)}</td>
      <td>${esc(act ? act.nombre : '—')}</td>
      <td>${formatDateDisplay(a.fecha)}</td>
      <td>${esc(a.hora)}</td>
      <td>${esc(a.metodo)}</td>
    </tr>`;
  }).join('') || `<tr><td colspan="5" class="text-steel">Sin registros aún.</td></tr>`;
});

function reiniciarDatos(){
  if(!confirmAction('Esto restaurará los datos de ejemplo originales. ¿Continuar?')) return;
  resetDatabase();
  location.reload();
}
