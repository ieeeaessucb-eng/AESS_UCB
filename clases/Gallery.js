// clases/Gallery.js
export class Gallery {
  constructor(
    rootSelector = '#galeria .gallery',
    dataUrl = './data/projects.json'
  ) {
    this.root = document.querySelector(rootSelector);
    this.dataUrl = dataUrl;
  }

  async render() {
    if (!this.root) return;

    let projects = [];
    try {
      const res = await fetch(this.dataUrl + `?v=${Date.now()}`, { cache: 'no-store' });
      projects = await res.json();
    } catch (e) {
      console.warn('[Gallery] No pude cargar', this.dataUrl, e);
      return; // deja cualquier HTML estático que haya
    }

    // Validación mínima
    const isProject = p => p && typeof p.title === 'string' && typeof p.date === 'string';
    projects = Array.isArray(projects) ? projects.filter(isProject) : [];
    if (!projects.length) {
      this.root.innerHTML = '<p style="color:var(--muted)">Pronto publicaremos nuestros proyectos ✨</p>';
      return;
    }

    // Orden general por fecha (nuevo primero)
    const byDateDesc = (a, b) => (a.date < b.date ? 1 : -1);
    const ordered = [...projects].sort(byDateDesc);

    // Destacado: primero featured (más reciente), si no, el más reciente por fecha
    const featuredPool = ordered.filter(p => !!p.featured);
    const featured = (featuredPool.length ? featuredPool : ordered)[0];

    // Resto: TODOS menos el destacado, en orden por fecha (se verán 3 por fila)
    const rest = ordered.filter(p => p !== featured);

    this.root.innerHTML = `
      <div class="gallery-featured-block">
        ${this._bigCard(featured)}
      </div>
      <div class="gallery-thumbs">
        ${rest.map(p => this._thumbCard(p)).join('')}
      </div>
    `;
  }

  // ---- tarjetas ----------
  _bigCard(p) {
    const title = this._esc(p.title || 'Proyecto');
    const date  = this._fmtDate(p.date);
    const img   = p.thumb || (p.images && p.images[0]);
    const videoBtn = p.video
      ? `<a class="btn ghost" href="${this._esc(p.video)}" target="_blank" rel="noopener">Ver video</a>`
      : '';

    return `
      <figure class="card big">
        ${this._imgTag(img, title, { height: 'clamp(260px, 52vw, 420px)' })}
        <figcaption>
          <h4>${title}</h4>
          <p>${this._esc(p.caption || '')}</p>
          <div class="meta"><span>${this._esc(date)}</span>${videoBtn}</div>
        </figcaption>
      </figure>
    `;
  }

  _thumbCard(p) {
    const title = this._esc(p.title || 'Proyecto');
    const date  = this._fmtDate(p.date);
    const img   = p.thumb || (p.images && p.images[0]);
    return `
      <figure class="card thumb">
        ${this._imgTag(img, title, { height: '160px' })}
        <figcaption>
          <h4>${title}</h4>
          <p>${this._esc(p.caption || '')}</p>
          <div class="meta"><span>${this._esc(date)}</span></div>
        </figcaption>
      </figure>
    `;
  }

  // ---- utilidades ----------
  _imgTag(src, alt, { height } = {}) {
    if (src) {
      return `<img src="${this._esc(src)}" alt="${this._esc(alt)}"
                   loading="lazy" decoding="async"
                   style="width:100%;height:${height};object-fit:cover;display:block;border-radius:12px">`;
    }
    const svg = this._svgPlaceholder(alt);
    return `<img alt="${this._esc(alt)}" loading="lazy" decoding="async"
                 src="data:image/svg+xml,${encodeURIComponent(svg)}"
                 style="width:100%;height:${height};object-fit:cover;display:block;border-radius:12px">`;
  }

  _fmtDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), dd = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${dd}`;
  }
  _esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  _svgPlaceholder(text=''){
    const label = (text.length>28)?text.slice(0,25)+'…':text;
    return `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='675'>
      <rect width='100%' height='100%' fill='#111418'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
            font-family='system-ui,Segoe UI,Roboto,Arial' font-size='28' fill='#b2bdc7'>${label}</text>
    </svg>`;
  }
}
export default Gallery;
