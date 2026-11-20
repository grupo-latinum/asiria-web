/* Plantilla de catálogos digitales · Asiria
   1) Lee datos.json de la carpeta del negocio.
   2) Dibuja categorías y productos.
   3) Lleva el pedido y arma el mensaje de WhatsApp.
   Todo el texto del negocio se inserta con textContent (nunca como HTML),
   así un dato mal escrito no puede romper ni "inyectar" nada en la página. */
(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, props = {}, ...hijos) => {
    const n = document.createElement(tag);
    Object.entries(props).forEach(([k, v]) => {
      if (k === 'texto') n.textContent = v;
      else if (k.startsWith('aria') || k.startsWith('data') || k === 'for' || k === 'role') n.setAttribute(k.replace(/[A-Z]/g, m => '-' + m.toLowerCase()), v);
      else n[k] = v;
    });
    hijos.flat().forEach(h => h && n.append(h));
    return n;
  };

  let datos, moneda = 'S/';
  const pedido = new Map();          // id de producto -> cantidad
  const productos = new Map();       // id -> producto
  let filtroCategoria = 'todas';
  let filtroTexto = '';
  const clave = 'pedido:' + location.pathname;

  const dinero = n => `${moneda} ${n.toFixed(2)}`;

  function guardar() {
    try { localStorage.setItem(clave, JSON.stringify([...pedido])); } catch (e) { /* sin almacenamiento: no pasa nada */ }
  }
  function recuperar() {
    try { (JSON.parse(localStorage.getItem(clave)) || []).forEach(([id, c]) => productos.has(id) && pedido.set(id, c)); } catch (e) { /* ignorar */ }
  }

  async function iniciar() {
    try {
      const r = await fetch('datos.json', { cache: 'no-cache' });
      datos = await r.json();
    } catch (e) {
      $('#contenido').append(el('p', { className: 'vacio', texto: 'No pudimos cargar el catálogo. Intenta de nuevo en unos segundos.' }));
      return;
    }
    moneda = datos.moneda || 'S/';
    if (datos.color) document.documentElement.style.setProperty('--marca', datos.color);
    document.title = `${datos.negocio} · Catálogo`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = `${datos.negocio}: ${datos.descripcion || 'catálogo digital'}. Pide por WhatsApp.`;

    datos.categorias.forEach((cat, ci) => cat.productos.forEach((p, pi) => {
      const id = `${ci}-${pi}`;
      productos.set(id, { ...p, id, categoria: cat.nombre });
    }));

    pintarCabecera();
    pintarChips();
    recuperar();
    pintarProductos();
    actualizarBarra();
  }

  function pintarCabecera() {
    if (datos.demo) {
      const aviso = $('#aviso-demo');
      aviso.hidden = false;
    }
    // Plan Pro: "firma": false oculta "Hecho por Asiria" (catálogo de marca blanca)
    if (datos.firma === false) $('#firma').hidden = true;
    const logo = $('#logo-negocio');
    if (datos.logo) logo.append(el('img', { src: datos.logo, alt: '' }));
    else logo.textContent = datos.negocio.trim().charAt(0).toUpperCase();
    $('#nombre-negocio').textContent = datos.negocio;
    $('#descripcion-negocio').textContent = datos.descripcion || '';
    const info = $('#datos-negocio');
    [datos.horario && '🕒 ' + datos.horario, datos.direccion && '📍 ' + datos.direccion, datos.entrega && '🛵 ' + datos.entrega]
      .filter(Boolean).forEach(t => info.append(el('span', { texto: t })));
  }

  function pintarChips() {
    const chips = $('#chips');
    const nombres = ['todas', ...datos.categorias.map(c => c.nombre)];
    nombres.forEach(n => {
      const b = el('button', { type: 'button', className: 'chip', texto: n === 'todas' ? 'Todo' : n, ariaPressed: String(n === filtroCategoria) });
      b.addEventListener('click', () => {
        filtroCategoria = n;
        chips.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(c === b)));
        pintarProductos();
      });
      chips.append(b);
    });
    $('#buscador').addEventListener('input', e => { filtroTexto = e.target.value.trim().toLowerCase(); pintarProductos(); });
  }

  function tarjeta(p) {
    const cant = pedido.get(p.id) || 0;
    const salida = el('output', { texto: String(cant), ariaLive: 'polite' });
    const menos = el('button', { type: 'button', className: 'btn-circulo menos', texto: '−', ariaLabel: `Quitar un ${p.nombre}` });
    const mas = el('button', { type: 'button', className: 'btn-circulo', texto: '+', ariaLabel: `Agregar un ${p.nombre}` });
    menos.hidden = cant === 0; salida.hidden = cant === 0;
    const cambiar = d => {
      const n = Math.max(0, (pedido.get(p.id) || 0) + d);
      n ? pedido.set(p.id, n) : pedido.delete(p.id);
      salida.textContent = String(n);
      menos.hidden = n === 0; salida.hidden = n === 0;
      guardar(); actualizarBarra();
    };
    menos.addEventListener('click', () => cambiar(-1));
    mas.addEventListener('click', () => cambiar(+1));
    return el('article', { className: 'producto' },
      el('img', { src: p.foto || '', alt: p.foto ? `Foto de ${p.nombre}` : '', loading: 'lazy', width: 88, height: 88 }),
      el('div', { className: 'info' },
        el('h3', { texto: p.nombre }),
        p.descripcion ? el('p', { texto: p.descripcion }) : null,
        el('span', { className: 'precio', texto: dinero(p.precio) })),
      el('div', { className: 'cantidad' }, menos, salida, mas));
  }

  function pintarProductos() {
    const cont = $('#contenido');
    cont.textContent = '';
    let hay = 0;
    datos.categorias.forEach((cat, ci) => {
      if (filtroCategoria !== 'todas' && filtroCategoria !== cat.nombre) return;
      const lista = el('div', { className: 'lista' });
      cat.productos.forEach((p, pi) => {
        const texto = (p.nombre + ' ' + (p.descripcion || '')).toLowerCase();
        if (filtroTexto && !texto.includes(filtroTexto)) return;
        lista.append(tarjeta(productos.get(`${ci}-${pi}`)));
        hay++;
      });
      if (lista.children.length) cont.append(el('section', { className: 'seccion' }, el('h2', { texto: cat.nombre }), lista));
    });
    if (!hay) cont.append(el('p', { className: 'vacio', texto: 'No encontramos productos con esa búsqueda.' }));
  }

  function resumen() {
    let unidades = 0, total = 0;
    const lineas = [];
    pedido.forEach((c, id) => {
      const p = productos.get(id);
      unidades += c; total += c * p.precio;
      lineas.push({ p, c });
    });
    return { unidades, total, lineas };
  }

  function actualizarBarra() {
    const { unidades, total } = resumen();
    const btn = $('#ver-pedido');
    btn.disabled = unidades === 0;
    $('#barra-texto').textContent = unidades ? `Ver pedido (${unidades})` : 'Elige tus productos';
    $('#barra-total').textContent = unidades ? dinero(total) : '';
    $('#estado-pedido').textContent = unidades ? `Pedido: ${unidades} productos, total ${dinero(total)}` : '';
  }

  function abrirPedido() {
    const { total, lineas } = resumen();
    const cont = $('#lineas');
    cont.textContent = '';
    lineas.forEach(({ p, c }) => cont.append(el('div', { className: 'linea' }, el('span', { texto: `${c} × ${p.nombre}` }), el('span', { texto: dinero(c * p.precio) }))));
    $('#total').textContent = dinero(total);
    actualizarEnlace();
    $('#ventana').showModal();
  }

  function actualizarEnlace() {
    const { total, lineas } = resumen();
    const nombre = $('#cliente').value.trim();
    const entrega = (document.querySelector('input[name="entrega"]:checked') || {}).value || 'Recojo en local';
    const direccion = $('#direccion').value.trim();
    const notas = $('#notas').value.trim();
    $('#campo-direccion').hidden = entrega !== 'Delivery';

    const partes = [];
    partes.push(`${datos.demo ? '[DEMO] ' : ''}Hola ${datos.negocio} 👋, quiero hacer este pedido:`, '');
    lineas.forEach(({ p, c }) => partes.push(`• ${c} × ${p.nombre} — ${dinero(c * p.precio)}`));
    partes.push('', `*Total: ${dinero(total)}*`, `Entrega: ${entrega}`);
    if (entrega === 'Delivery' && direccion) partes.push(`Dirección: ${direccion}`);
    if (nombre) partes.push(`Nombre: ${nombre}`);
    if (notas) partes.push(`Notas: ${notas}`);
    const numero = String(datos.whatsapp).replace(/\D/g, '');
    $('#enviar').href = `https://wa.me/${numero}?text=${encodeURIComponent(partes.join('\n'))}`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    $('#ver-pedido').addEventListener('click', abrirPedido);
    $('#cerrar').addEventListener('click', () => $('#ventana').close());
    $('#ventana').addEventListener('click', e => { if (e.target.id === 'ventana') e.target.close(); });
    ['#cliente', '#direccion', '#notas'].forEach(s => $(s).addEventListener('input', actualizarEnlace));
    document.querySelectorAll('input[name="entrega"]').forEach(r => r.addEventListener('change', actualizarEnlace));
    iniciar();
  });
})();
