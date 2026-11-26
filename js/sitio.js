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

    // ¿El visitante prefiere menos movimiento?
    const quieto = () => root.dataset.motion === 'on' || matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ===== Palabra que cambia en la portada =====
    const palabra = document.getElementById('rubro');
    if (palabra) {
      const rubros = ['restaurantes', 'pastelerías', 'cafeterías', 'bodegas', 'boutiques', 'ferreterías', 'florerías'];
      let i = 0;
      setInterval(() => {
        if (quieto() || document.hidden) return;
        palabra.classList.add('sale');
        setTimeout(() => {
          i = (i + 1) % rubros.length;
          palabra.textContent = rubros[i];
          palabra.classList.remove('sale');
          palabra.classList.add('entra');
          void palabra.offsetWidth; // reinicia la transición
          palabra.classList.remove('entra');
        }, 450);
      }, 2400);
    }

    // ===== Pestañas por rubro con chat animado =====
    const ejemplos = {
      restaurante: {
        icono: '🍽️',
        texto: 'Tu carta con fotos y precios. El cliente arma su pedido para delivery o recojo, con sus indicaciones.',
        items: ['2 × Arroz con pato — S/ 76.00', '1 × Ceviche de mero — S/ 42.00', '2 × Chicha morada — S/ 16.00'],
        total: 'S/ 134.00', datos: ['Entrega: Delivery', 'Dirección: Av. Balta 123', 'Notas: sin ají, por favor']
      },
      pasteleria: {
        icono: '🎂',
        texto: 'Tortas, postres y bocaditos con sus tamaños. El cliente deja la dedicatoria y la hora de recojo.',
        items: ['1 × Torta de chocolate (20 porciones) — S/ 95.00', '12 × Alfajores — S/ 24.00'],
        total: 'S/ 119.00', datos: ['Entrega: Recojo en local', 'Notas: “Feliz cumpleaños” en la torta, recojo a las 5 p. m.']
      },
      bodega: {
        icono: '🛒',
        texto: 'Tu lista de productos por categorías. Tus vecinos hacen su pedido completo sin llamarte.',
        items: ['2 × Arroz 5 kg — S/ 46.00', '1 × Aceite 1 L — S/ 11.50', '6 × Gaseosa 500 ml — S/ 15.00'],
        total: 'S/ 72.50', datos: ['Entrega: Delivery', 'Dirección: Calle Los Pinos 240']
      },
      boutique: {
        icono: '👗',
        texto: 'Tus prendas con fotos, tallas y precios. El cliente elige y te escribe con todo definido.',
        items: ['1 × Blusa de lino, talla M — S/ 69.00', '1 × Jean slim, talla 28 — S/ 99.00'],
        total: 'S/ 168.00', datos: ['Entrega: Delivery', 'Notas: la blusa en color beige']
      }
    };
    const pestanas = [...document.querySelectorAll('.pestanas [role="tab"]')];
    const panelRubro = document.getElementById('panel-rubro');
    const msg = document.getElementById('chat-msg');
    const escribiendo = document.getElementById('chat-escribiendo');
    const estado = document.getElementById('chat-estado');
    let espera;

    function parrafo(lineas, negrita) {
      const p = document.createElement('p');
      lineas.forEach((t, n) => {
        if (n) p.append(document.createElement('br'));
        if (negrita && n === 0) { const b = document.createElement('b'); b.textContent = t; p.append(b); }
        else p.append(document.createTextNode(t));
      });
      return p;
    }
    function pintarMensaje(e) {
      const hora = document.createElement('small');
      hora.textContent = '12:41 ✓✓';
      msg.replaceChildren(parrafo(['Hola 👋, quiero hacer este pedido:']), parrafo(e.items.map(t => '• ' + t)), parrafo(['Total: ' + e.total, ...e.datos], true), hora);
    }
    function elegir(tab, foco) {
      const e = ejemplos[tab.dataset.rubro];
      pestanas.forEach(t => { const si = t === tab; t.setAttribute('aria-selected', String(si)); t.tabIndex = si ? 0 : -1; });
      if (foco) tab.focus();
      panelRubro.setAttribute('aria-labelledby', tab.id);
      document.getElementById('rubro-texto').textContent = e.texto;
      document.getElementById('chat-avatar').textContent = e.icono;
      clearTimeout(espera);
      if (quieto()) { pintarMensaje(e); return; }
      msg.hidden = true; escribiendo.hidden = false; estado.textContent = 'escribiendo…';
      espera = setTimeout(() => {
        pintarMensaje(e);
        escribiendo.hidden = true; msg.hidden = false; estado.textContent = 'en línea';
        msg.classList.remove('aparece'); void msg.offsetWidth; msg.classList.add('aparece');
      }, 900);
    }
    pestanas.forEach((tab, n) => {
      tab.addEventListener('click', () => elegir(tab));
      tab.addEventListener('keydown', ev => {
        const mover = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[ev.key];
        if (mover) { ev.preventDefault(); elegir(pestanas[(n + mover + pestanas.length) % pestanas.length], true); }
        else if (ev.key === 'Home') { ev.preventDefault(); elegir(pestanas[0], true); }
        else if (ev.key === 'End') { ev.preventDefault(); elegir(pestanas[pestanas.length - 1], true); }
      });
    });
    // Al llegar a la sección, el primer mensaje "se escribe" una vez
    if (panelRubro && 'IntersectionObserver' in window) {
      const ioChat = new IntersectionObserver(en => {
        if (en[0].isIntersecting) { elegir(pestanas.find(t => t.getAttribute('aria-selected') === 'true')); ioChat.disconnect(); }
      }, { threshold: 0.4 });
      ioChat.observe(panelRubro);
    }

    const anio = document.getElementById('anio');
    if (anio) anio.textContent = new Date().getFullYear();
  });
})();
