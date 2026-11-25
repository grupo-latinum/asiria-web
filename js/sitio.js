/* Sitio de Asiria · panel de accesibilidad y animaciones suaves */
(function () {
  'use strict';
  const root = document.documentElement;
  root.classList.add('js');

  document.addEventListener('DOMContentLoaded', () => {
    // ===== Panel de accesibilidad =====
    const KEY = 'asiria-a11y';
    const panel = document.getElementById('a11yPanel');
    const boton = document.getElementById('a11yBtn');
    const cargar = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } };
    const guardar = p => { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) { /* solo dura esta visita */ } };
    let prefs = cargar();

    function aplicar() {
      if (prefs.size) root.dataset.size = prefs.size; else delete root.dataset.size;
      ['contrast', 'links', 'motion', 'spacing'].forEach(k => {
        if (prefs[k]) root.dataset[k] = 'on'; else delete root.dataset[k];
        panel.querySelector(`[data-toggle="${k}"]`).setAttribute('aria-checked', String(!!prefs[k]));
      });
      panel.querySelectorAll('[data-size]').forEach(b => b.setAttribute('aria-pressed', String((prefs.size || '') === b.dataset.size)));
      guardar(prefs);
    }
    function abrir(si) {
      panel.hidden = !si;
      boton.setAttribute('aria-expanded', String(si));
      if (si) panel.querySelector('button').focus();
    }
    boton.addEventListener('click', () => abrir(panel.hidden));
    document.getElementById('a11yCerrar').addEventListener('click', () => { abrir(false); boton.focus(); });
    panel.querySelectorAll('[data-size]').forEach(b => b.addEventListener('click', () => { prefs.size = b.dataset.size; aplicar(); }));
    panel.querySelectorAll('[data-toggle]').forEach(b => b.addEventListener('click', () => { prefs[b.dataset.toggle] = !prefs[b.dataset.toggle]; aplicar(); }));
    document.getElementById('a11yReset').addEventListener('click', () => { prefs = {}; aplicar(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) { abrir(false); boton.focus(); } });
    document.addEventListener('click', e => { if (!panel.hidden && !panel.contains(e.target) && !boton.contains(e.target)) abrir(false); });
    aplicar();

    // ===== Aparición suave al hacer scroll =====
    const piezas = document.querySelectorAll('.revelar');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entradas => entradas.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
      }), { threshold: 0.15 });
      piezas.forEach(p => io.observe(p));
    } else {
      piezas.forEach(p => p.classList.add('visible'));
    }

    const anio = document.getElementById('anio');
    if (anio) anio.textContent = new Date().getFullYear();
  });
})();
