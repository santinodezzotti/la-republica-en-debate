const API = 'https://la-republica-en-debate.onrender.com/api';

// ===== CARGAR ARTÍCULOS =====
async function cargarArticulos() {
  const container = document.getElementById('articulos-container');
  try {
    const res = await fetch(`${API}/articulos`);
    const articulos = await res.json();

    if (articulos.length === 0) {
      container.innerHTML = `
        <div class="sin-articulos">
          <h2>🇦🇷 Bienvenido a La República en Debate</h2>
          <p>Pronto encontrarás aquí los primeros artículos de opinión.</p>
        </div>`;
      return;
    }

    container.innerHTML = articulos.map(a => `
      <div class="articulo-card" onclick="verArticulo('${a._id}')">
        ${a.imagen
          ? `<img class="articulo-card-img" src="${a.imagen}" alt="${a.titulo}">`
          : `<div class="articulo-card-img sin-imagen">🇦🇷</div>`
        }
        <div class="articulo-card-body">
          <p class="articulo-categoria">${a.categoria}</p>
          <h2>${a.titulo}</h2>
          <p class="articulo-resumen">${a.resumen}</p>
          <div class="articulo-meta">
            <span>✍️ ${a.autor}</span>
            <span>${formatearFecha(a.fechaCreacion)}</span>
          </div>
        </div>
      </div>
    `).join('');

  } catch (err) {
    container.innerHTML = `
      <div class="sin-articulos">
        <h2>Error al cargar artículos</h2>
        <p>Asegurate de que el servidor esté corriendo.</p>
      </div>`;
  }
}

// ===== VER ARTÍCULO =====
function verArticulo(id) {
  window.location.href = `articulo.html?id=${id}`;
}

// ===== NEWSLETTER =====
async function suscribirse() {
  const email = document.getElementById('newsletter-email').value;
  const mensaje = document.getElementById('newsletter-mensaje');

  if (!email) {
    mensaje.textContent = 'Por favor ingresá tu email.';
    mensaje.style.color = '#ffcccc';
    return;
  }

  try {
    const res = await fetch(`${API}/newsletter/suscribir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();

    if (res.ok) {
      mensaje.textContent = '✅ ' + data.mensaje;
      mensaje.style.color = '#ccffcc';
      document.getElementById('newsletter-email').value = '';
    } else {
      mensaje.textContent = '⚠️ ' + data.error;
      mensaje.style.color = '#ffcccc';
    }
  } catch (err) {
    mensaje.textContent = '❌ Error al conectar con el servidor.';
    mensaje.style.color = '#ffcccc';
  }
}

// ===== UTILIDADES =====
function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

// ===== INIT =====
cargarArticulos();