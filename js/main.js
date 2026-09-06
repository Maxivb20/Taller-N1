/* =========================================================
   ClubTrack — main.js
   Utilidades compartidas por todas las páginas.
   ========================================================= */

// Marca el link activo del sidebar según la página actual
document.addEventListener('DOMContentLoaded', () => {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sidebar a.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if(href === current){
      link.classList.add('active');
    }
  });
});

// Toast simple reutilizando el contenedor #toast-area presente en cada página
function showToast(mensaje, tipo = 'success'){
  const area = document.getElementById('toast-area');
  if(!area) { alert(mensaje); return; }

  const bg = tipo === 'success' ? 'var(--court)' : (tipo === 'error' ? 'var(--alert)' : 'var(--ink)');
  const el = document.createElement('div');
  el.style.cssText = `background:${bg};color:#fff;padding:12px 16px;border-radius:4px;margin-bottom:8px;
    font-size:0.88rem;box-shadow:0 6px 18px rgba(0,0,0,0.18);min-width:240px;opacity:0;
    transform:translateY(-6px);transition:all .18s ease;`;
  el.textContent = mensaje;
  area.appendChild(el);
  requestAnimationFrame(() => { el.style.opacity = 1; el.style.transform = 'translateY(0)'; });
  setTimeout(() => {
    el.style.opacity = 0;
    el.style.transform = 'translateY(-6px)';
    setTimeout(() => el.remove(), 200);
  }, 2600);
}

// Escapa texto para insertar de forma segura en innerHTML
function esc(str){
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

// Lee parámetros de la URL
function getQueryParam(name){
  return new URLSearchParams(window.location.search).get(name);
}

function confirmAction(mensaje){
  return window.confirm(mensaje);
}
