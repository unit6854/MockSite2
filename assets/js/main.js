/* ==========================================================================
   WARRIOR OF GOD TACTICAL — main.js
   Handles: Age gate, nav, WebGL hero, content injection, scroll animations
   ========================================================================== */

'use strict';

/* --------------------------------------------------------------------------
   Helpers
   -------------------------------------------------------------------------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const qs = (typeof SITE_CONTENT !== 'undefined') ? SITE_CONTENT : {}; // safe alias

/* --------------------------------------------------------------------------
   1. DOCUMENT READY
   -------------------------------------------------------------------------- */
document.documentElement.classList.remove('no-js');

document.addEventListener('DOMContentLoaded', () => {
  initAgeGate();
  initNav();
  initScrollAnimations();
  initShop();
  initSearch();
  initNewsletter();
  initContactForm();
  initFooterYear();
  initFooterShield();
  initLogoRotate();
});

/* --------------------------------------------------------------------------
   2. AGE GATE
   -------------------------------------------------------------------------- */
function initAgeGate() {
  const gate    = $('#age-gate');
  const wrapper = $('#site-wrapper');
  const confirm = $('#age-gate-confirm');
  const deny    = $('#age-gate-deny');
  const cfg     = (qs.site && qs.site.ageGate) ? qs.site.ageGate
                : { cookieName:'wog_age_verified', cookieDays:7, redirectUrl:'https://google.com' };

  function setCookie(name, value, days) {
    const exp = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value};expires=${exp};path=/;SameSite=Lax`;
  }
  function setStorage() {
    try { localStorage.setItem('wog_age_verified', 'yes'); } catch(e) {}
  }

  // Head script added .age-verified to <html> before first paint if cookie/storage exists.
  if (document.documentElement.classList.contains('age-verified')) {
    gate?.remove();
    wrapper?.removeAttribute('hidden');
    initHeroWebGL();
    setTimeout(triggerScrollAnimations, 50);
    return;
  }

  // First visit — show gate, lock scroll.
  document.body.style.overflow = 'hidden';
  confirm?.focus();

  confirm?.addEventListener('click', () => {
    setCookie(cfg.cookieName, 'yes', cfg.cookieDays);
    setStorage();
    document.documentElement.classList.add('age-verified');

    // Unlock immediately — don't wait for animation (CSS hides gate instantly
    // via the age-verified rule, so animationend would never fire anyway).
    document.body.style.overflow = '';
    wrapper?.removeAttribute('hidden');
    initHeroWebGL();
    triggerScrollAnimations();

    // Fade gate out then remove it
    gate?.classList.add('hidden');
    setTimeout(() => gate?.remove(), 400);
  });

  deny?.addEventListener('click', () => {
    window.location.href = cfg.redirectUrl;
  });
}

/* --------------------------------------------------------------------------
   3. NAVIGATION
   -------------------------------------------------------------------------- */
function initNav() {
  const header    = $('#site-header');
  const mobileBtn = $('.mobile-menu-toggle');
  const nav       = $('#primary-nav');

  // Scroll: add .scrolled class — rAF-throttled so it runs at most once per frame
  let _scrollTicking = false;
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
    updateActiveNavLink();
    _scrollTicking = false;
  };
  window.addEventListener('scroll', () => {
    if (!_scrollTicking) { requestAnimationFrame(onScroll); _scrollTicking = true; }
  }, { passive: true });
  onScroll();

  // Mobile menu toggle
  mobileBtn?.addEventListener('click', () => {
    const open = mobileBtn.getAttribute('aria-expanded') === 'true';
    mobileBtn.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('open', !open);
    document.body.style.overflow = !open ? 'hidden' : '';
  });

  // Close on outside click (mobile)
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('open') && !header.contains(e.target)) {
      mobileBtn.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  // Smooth scroll for anchor links
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.getElementById(link.getAttribute('href').slice(1));
    if (!target) return;
    e.preventDefault();
    // Close mobile menu
    mobileBtn?.setAttribute('aria-expanded', 'false');
    nav?.classList.remove('open');
    document.body.style.overflow = '';
    const offset = header.offsetHeight + 8;
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    // Activate a shop tab if the link specifies one
    const tab = link.dataset.shopTab;
    if (tab) {
      const tabBtn = document.querySelector(`.shop-tab[data-tab="${tab}"]`);
      tabBtn?.click();
    }
  });
}

let _navSections = null, _navLinks = null;
function updateActiveNavLink() {
  _navSections = _navSections || $$('section[id], main section[id]');
  _navLinks    = _navLinks    || $$('.primary-nav__link');
  let current = '';
  _navSections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  _navLinks.forEach(link => {
    const href = link.getAttribute('href')?.replace('#', '');
    link.classList.toggle('active', href === current);
  });
}

/* --------------------------------------------------------------------------
   4. SEARCH PANEL
   -------------------------------------------------------------------------- */
function initSearch() {
  const toggle = $('.search-toggle');
  const panel  = $('#search-panel');
  if (!toggle || !panel) return;

  toggle.addEventListener('click', () => {
    const hidden = panel.hasAttribute('hidden');
    panel.toggleAttribute('hidden', !hidden);
    if (hidden) panel.querySelector('input')?.focus();
  });
}

/* --------------------------------------------------------------------------
   5. HERO WEBGL — Raw WebGL Particle Field (no Three.js dependency)
   Graceful degradation: if WebGL unavailable, hero bg image is the fallback.
   -------------------------------------------------------------------------- */
function initHeroWebGL() {
  const canvas = $('#hero-canvas');
  if (!canvas) return;

  const gl = canvas.getContext('webgl', {
    alpha: true, antialias: false, powerPreference: 'low-power', preserveDrawingBuffer: false,
  });
  if (!gl) return;

  const vert = `
    attribute vec3 a_pos;
    attribute vec3 a_col;
    attribute float a_sz;
    uniform mat4 u_proj;
    uniform mat4 u_mv;
    varying vec3 v_col;
    void main(){
      v_col=a_col;
      vec4 mv=u_mv*vec4(a_pos,1.0);
      gl_Position=u_proj*mv;
      gl_PointSize=a_sz*(400.0/-mv.z);
    }`;
  const frag = `
    precision mediump float;
    varying vec3 v_col;
    uniform float u_alpha;
    void main(){
      vec2 c=gl_PointCoord-0.5;
      if(dot(c,c)>0.25)discard;
      gl_FragColor=vec4(v_col,u_alpha);
    }`;

  function mkShader(type, src) {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, mkShader(gl.VERTEX_SHADER, vert));
  gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const loc = {
    aPos:  gl.getAttribLocation(prog, 'a_pos'),
    aCol:  gl.getAttribLocation(prog, 'a_col'),
    aSz:   gl.getAttribLocation(prog, 'a_sz'),
    proj:  gl.getUniformLocation(prog, 'u_proj'),
    mv:    gl.getUniformLocation(prog, 'u_mv'),
    alpha: gl.getUniformLocation(prog, 'u_alpha'),
  };

  // Interleaved VBO: pos(3) col(3) sz(1) = 7 floats/vertex
  const N = 700, S = 7;
  const data = new Float32Array(N * S);
  const cyan  = [0.0,  0.85, 1.0 ]; // #00D9FF
  const white = [1.0,  1.0,  1.0 ]; // #FFFFFF
  for (let i = 0; i < N; i++) {
    const o = i * S;
    data[o]   = (Math.random() - 0.5) * 1200;
    data[o+1] = (Math.random() - 0.5) * 800;
    data[o+2] = (Math.random() - 0.5) * 600;
    const c = Math.random() > 0.75 ? cyan : white;
    data[o+3] = c[0]; data[o+4] = c[1]; data[o+5] = c[2];
    data[o+6] = Math.random() * 2.5 + 0.5;
  }
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  const bpe = Float32Array.BYTES_PER_ELEMENT;
  gl.enableVertexAttribArray(loc.aPos); gl.vertexAttribPointer(loc.aPos, 3, gl.FLOAT, false, S*bpe, 0);
  gl.enableVertexAttribArray(loc.aCol); gl.vertexAttribPointer(loc.aCol, 3, gl.FLOAT, false, S*bpe, 3*bpe);
  gl.enableVertexAttribArray(loc.aSz);  gl.vertexAttribPointer(loc.aSz,  1, gl.FLOAT, false, S*bpe, 6*bpe);

  // Pre-allocated matrix buffers (column-major, WebGL convention)
  const _proj = new Float32Array(16);
  const _mv   = new Float32Array(16);

  function setPerspective(fovDeg, aspect) {
    const f = 1 / Math.tan(fovDeg * Math.PI / 360), nf = 1 / (0.1 - 1000);
    _proj.fill(0);
    _proj[0] = f / aspect; _proj[5] = f;
    _proj[10] = (1000 + 0.1) * nf; _proj[11] = -1;
    _proj[14] = 2 * 1000 * 0.1 * nf;
  }

  // MV = translate(-cx,-cy,-400) * RotX * RotY  (column-major)
  function buildMV(rX, rY, cx, cy) {
    const cX=Math.cos(rX), sX=Math.sin(rX), cY=Math.cos(rY), sY=Math.sin(rY);
    _mv[0]=cY;   _mv[1]=sX*sY;  _mv[2]=-cX*sY; _mv[3]=0;
    _mv[4]=0;    _mv[5]=cX;     _mv[6]=sX;     _mv[7]=0;
    _mv[8]=sY;   _mv[9]=-sX*cY; _mv[10]=cX*cY; _mv[11]=0;
    _mv[12]=-cx; _mv[13]=-cy;   _mv[14]=-400;  _mv[15]=1;
  }

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight || 1;
    canvas.width  = Math.round(w * Math.min(devicePixelRatio, 1.5));
    canvas.height = Math.round(h * Math.min(devicePixelRatio, 1.5));
    gl.viewport(0, 0, canvas.width, canvas.height);
    setPerspective(60, w / h);
    gl.uniformMatrix4fv(loc.proj, false, _proj);
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // additive blending

  let heroVisible = true, tabVisible = !document.hidden;
  let running = heroVisible && tabVisible;
  let frame = 0, lastRender = 0;
  let rotX = 0, rotY = 0, camX = 0, camY = 0, mouseX = 0, mouseY = 0;

  function updateRunning() {
    const was = running;
    running = heroVisible && tabVisible;
    if (running && !was) animate(performance.now());
  }
  document.addEventListener('visibilitychange', () => {
    tabVisible = !document.hidden;
    updateRunning();
  });

  window.addEventListener('mousemove', (e) => {
    if (!running) return;
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 0.4;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 0.4;
  }, { passive: true });

  function animate(now) {
    if (!running) return;
    requestAnimationFrame(animate);
    if (now - lastRender < 32) return; // ~30fps cap
    lastRender = now;
    frame++;
    rotY += 0.0006; rotX += 0.0003;
    camX += (mouseX * 60 - camX) * 0.078;
    camY += (-mouseY * 40 - camY) * 0.078;
    buildMV(rotX, rotY, camX, camY);
    gl.uniformMatrix4fv(loc.mv, false, _mv);
    gl.uniform1f(loc.alpha, 0.45 + Math.sin(frame * 0.00534) * 0.1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, N);
  }
  if (running) animate(performance.now());

  const hero   = $('#hero');
  const logoEl = document.getElementById('logo-neon-canvas');
  if (hero) {
    const obs = new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      updateRunning();
      if (logoEl) logoEl.style.animationPlayState = heroVisible ? 'running' : 'paused';
    }, { rootMargin: '200px' });
    obs.observe(hero);
  }
}


/* --------------------------------------------------------------------------
   6. SCROLL ANIMATIONS — Intersection Observer
   -------------------------------------------------------------------------- */
function initScrollAnimations() {
  const els = $$('.animate-on-scroll');
  if (!els.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = parseInt(el.dataset.delay || 0, 10);
      setTimeout(() => el.classList.add('is-visible'), delay);
      obs.unobserve(el);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => obs.observe(el));

  // Hero elements animate in immediately via CSS, triggered on load
  const heroEls = $$('.hero__eyebrow, .hero__heading, .hero__subheading, .hero__actions');
  heroEls.forEach((el, i) => {
    setTimeout(() => {
      el.style.transition = 'opacity 0.8s var(--ease-out-expo), transform 0.8s var(--ease-out-expo)';
      el.style.opacity = '1';
      el.style.transform = 'none';
    }, 300 + i * 140);
  });
}

function triggerScrollAnimations() {
  // Fire for elements already in view on load
  $$('.animate-on-scroll').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      const delay = parseInt(el.dataset.delay || 0, 10);
      setTimeout(() => el.classList.add('is-visible'), delay);
    }
  });
}

/* --------------------------------------------------------------------------
   7. FEATURED PRODUCTS — Homepage spotlight (featured:true items)
   Full catalog lives at shop.html
   -------------------------------------------------------------------------- */
function initShop() {
  const grid = $('#product-grid');
  if (!grid) return;

  // products.js loads with defer before main.js — WOG_PRODUCTS is always defined by this point
  const featured = WOG_PRODUCTS.filter(p => p.featured).slice(0, 8);
  if (!featured.length) { grid.closest('section')?.remove(); return; }
  grid.innerHTML = featured.map(p => {
    const badgeHTML = p.badge
      ? `<span class="product-card__badge">${p.badge}</span>` : '';
    const origHTML = p.originalPrice
      ? `<span class="product-card__original-price">$${p.originalPrice.toFixed(2)}</span>` : '';
    return `<article class="product-card animate-on-scroll is-visible" role="listitem">
      <div class="product-card__img-wrap">
        <img src="${p.image}" alt="${p.name}" loading="lazy"
             onerror="this.src='https://placehold.co/350x250/0f1923/0ea5e9?text=${encodeURIComponent(p.name)}&font=oswald'" />
        ${badgeHTML}
        ${!p.inStock ? '<div class="product-card__out-of-stock">Out of Stock</div>' : ''}
      </div>
      <div class="product-card__body">
        <p class="product-card__category">${p.brand}</p>
        <h3 class="product-card__name">${p.name}</h3>
        <p class="product-card__desc">${p.description.slice(0, 90)}${p.description.length > 90 ? '…' : ''}</p>
        <div class="product-card__price-row">
          <span class="product-card__price">$${p.price.toFixed(2)}</span>
          ${origHTML}
        </div>
        <div class="product-card__actions">
          <a href="product.html?id=${encodeURIComponent(p.id)}" class="btn btn--primary btn--sm">View Product</a>
        </div>
      </div>
    </article>`;
  }).join('');
}

/* --------------------------------------------------------------------------
   9. NEWSLETTER FORM
   -------------------------------------------------------------------------- */
function initNewsletter() {
  const form = $('.newsletter__form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const btn   = form.querySelector('button[type="submit"]');
    if (!input?.value) return;
    btn.textContent = '✓ Subscribed!';
    btn.disabled = true;
    input.value = '';
    setTimeout(() => { btn.textContent = 'Subscribe'; btn.disabled = false; }, 4000);
  });
}

/* --------------------------------------------------------------------------
   10. CONTACT FORM
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = $('.contact-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = '✓ Message Sent!';
    btn.disabled = true;
    form.reset();
    setTimeout(() => { btn.textContent = 'Send Message'; btn.disabled = false; }, 5000);
  });
}

/* --------------------------------------------------------------------------
   11. LOGO DRAG-TO-ROTATE (touch only)
   -------------------------------------------------------------------------- */
function initLogoRotate() {
  const wrap = document.querySelector('.hero__logo-wrap');
  if (!wrap) return;

  wrap.style.touchAction = 'none';
  wrap.style.cursor      = 'grab';

  let isDragging     = false;
  let startX = 0, startY = 0;
  let rotX   = 0, rotY   = 0;
  let hintGone = false;

  const hint = document.getElementById('logo-rotate-hint');

  function getEl() {
    return wrap.querySelector('#logo-neon-canvas') || wrap.querySelector('.hero-logo-fallback');
  }

  wrap.addEventListener('pointerdown', (e) => {
    e.preventDefault(); // block browser native drag on canvas
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    wrap.style.cursor = 'grabbing';
    wrap.setPointerCapture(e.pointerId);
    if (hint && !hintGone) { hintGone = true; hint.classList.add('is-hidden'); }
  });

  wrap.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    startX = e.clientX;
    startY = e.clientY;
    rotY += dx * 0.5;
    rotX -= dy * 0.5;
    const el = getEl();
    if (el) el.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  });

  wrap.addEventListener('pointerup',     () => { isDragging = false; wrap.style.cursor = 'grab'; });
  wrap.addEventListener('pointercancel', () => { isDragging = false; wrap.style.cursor = 'grab'; });
}

/* --------------------------------------------------------------------------
   12. FOOTER SHIELD — pause shieldPulse animation when footer is off-screen
   -------------------------------------------------------------------------- */
function initFooterShield() {
  const logoLink = document.querySelector('.footer-brand__logo');
  if (!logoLink) return;
  const obs = new IntersectionObserver(([entry]) => {
    logoLink.classList.toggle('anim-paused', !entry.isIntersecting);
  }, { rootMargin: '100px' });
  obs.observe(logoLink);
}

/* --------------------------------------------------------------------------
   13. FOOTER YEAR
   -------------------------------------------------------------------------- */
function initFooterYear() {
  const el = $('#footer-year');
  if (el) el.textContent = new Date().getFullYear();
}
