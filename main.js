// main.js
document.addEventListener('DOMContentLoaded', async () => {
  // --- Fallback CSS: --card2 si se olvidó en :root ---
  const root = document.documentElement;
  if (!getComputedStyle(root).getPropertyValue('--card2').trim()) {
    root.style.setProperty('--card2', '#0c0f14');
  }

  // --- Scroll suave del menú (sin depender de módulos) ---
  document.querySelectorAll('.menu a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id && id.startsWith('#')) {
        const el = document.querySelector(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // --- Reveal al hacer scroll (nativo, sin módulos) ---
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('on');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.1 });
    revealEls.forEach(el => io.observe(el));
  } else {
    // Fallback sin IO
    revealEls.forEach(el => el.classList.add('on'));
  }

  // --- Hero video: intento de autoplay silencioso ---
  const heroVideo = document.querySelector('#inicio video');
  if (heroVideo) {
    try {
      const p = heroVideo.play?.();
      if (p && typeof p.then === 'function') {
        p.catch(() => {
          heroVideo.muted = true;
          heroVideo.play?.().catch(() => {});
        });
      }
    } catch (_) {}
  }

  // --- Galería data-driven opcional ---
  // Si existen ./clases/Gallery.js y ./data/projects.json, la galería se vuelve dinámica.
  // Si NO existen, NO pasa nada: se queda la galería estática del HTML.
  try {
    const mod = await import('./clases/Gallery.js'); // asegura que exista la carpeta clases/
    const Gallery = mod.Gallery || mod.default;
    if (typeof Gallery === 'function') {
      const gal = new Gallery('#galeria .gallery', './data/projects.json');
      await gal.render();
    }
  } catch (err) {
    console.info('Galería JSON no habilitada (se mantiene la galería estática). Detalle:', err);
  }
});
