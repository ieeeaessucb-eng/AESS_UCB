// clases/Gallery.js
export class Gallery {
  constructor(rootSelector = '#galeria .gallery', dataUrl = './data/projects.json') {
    this.root = document.querySelector(rootSelector);
    this.dataUrl = dataUrl;
  }

  async render() {
    if (!this.root) return;

    let projects = [];
    try {
      // cache-bust simple para que tome cambios recientes
      const res = await fetch(this.dataUrl + `?v=${Date.now()}`);
      projects = await res.json();
    } catch (e) {
      this.root.innerHTML = `<p style="color:var(--muted)">No pude cargar la galería. Verifica <code>${this.dataUrl}</code>.</p>`;
      return;
    }
    if (!Array.isArray(projects) || projects.length === 0) {
      this.root.innerHTML = `<p style="color:var(--muted)">Aún no hay proyectos en el JSON.</p>`;
      return;
    }

    // Destacado: primero los featured, luego por fecha desc
    const byDateDesc = (a, b) => (a.date < b.date ? 1 : -1);
    const sorted = [...projects].sort((a, b) => {
      if (!!b.featured - !!a.featured !== 0) return (!!b.featured - !!a.featured);
      return byDateDesc(a, b);
    });

    const featured = sorted[0];
    const rest = sorted.slice(1);

    this.root.innerHTML = `
      <div class="gallery-featured">
        ${this._card(featured, true)}
      </div>
      <div class="gallery-grid">
        ${rest.map(p => this._card(p)).join('')}
      </div>
    `;
  }

  _card(p, isFeatured = false) {
    const img = p.thumb || (p.images && p.images[0]) || '';
    const btnVideo = p.video ? `<a class="btn ghost" href="${p.video}" target="_blank" rel="noopener">Ver video</a>` : '';
    return `
      <figure class="card ${isFeatured ? 'featured' : ''}">
        ${img ? `<img src="${img}" alt="${this._esc(p.title)}">` : ''}
        <figcaption>
          <h4>${this._esc(p.title || 'Proyecto')}</h4>
          <p>${this._esc(p.caption || '')}</p>
          <div class="meta">
            <span>${this._esc(p.date || '')}</span>
            ${btnVideo}
          </div>
        </figcaption>
      </figure>
    `;
  }

  _esc(s='') {
    return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
}
