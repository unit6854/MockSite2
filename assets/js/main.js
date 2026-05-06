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
  initFooterNeonLogo();
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

  // Scroll: add .scrolled class
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
    updateActiveNavLink();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
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

function updateActiveNavLink() {
  const sections = $$('section[id], main section[id]');
  const links = $$('.primary-nav__link');
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  links.forEach(link => {
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
   5. HERO WEBGL — Three.js Particle Field
   Graceful degradation: if Three.js fails, hero bg image is the fallback.
   -------------------------------------------------------------------------- */
function initHeroWebGL() {
  const canvas = $('#hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  let running = true;
  const W = canvas.clientWidth, H = canvas.clientHeight;

  // Renderer
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(W, H);

  // Scene / Camera
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
  camera.position.z = 400;

  // Particle system
  const PARTICLE_COUNT = 1200;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors    = new Float32Array(PARTICLE_COUNT * 3);
  const sizes     = new Float32Array(PARTICLE_COUNT);

  const goldColor  = new THREE.Color(0xc8963e);
  const whiteColor = new THREE.Color(0xf0ede8);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Spread particles across the viewport
    positions[i * 3]     = (Math.random() - 0.5) * 1200;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 800;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 600;

    const mix = Math.random();
    const col = mix > 0.85 ? goldColor : whiteColor;
    colors[i * 3]     = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;

    sizes[i] = Math.random() * 2.5 + 0.5;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colors,    3));
  geo.setAttribute('size',     new THREE.BufferAttribute(sizes,     1));

  const mat = new THREE.PointsMaterial({
    size: 1.8,
    vertexColors: true,
    transparent: true,
    opacity: 0.55,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  // Mouse parallax
  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 0.4;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 0.4;
  }, { passive: true });

  // Resize
  window.addEventListener('resize', () => {
    if (!running) return;
    const nW = canvas.clientWidth, nH = canvas.clientHeight;
    renderer.setSize(nW, nH);
    camera.aspect = nW / nH;
    camera.updateProjectionMatrix();
  }, { passive: true });

  // Animate
  let frame = 0;
  function animate() {
    if (!running) return;
    requestAnimationFrame(animate);
    frame++;

    particles.rotation.y += 0.0003;
    particles.rotation.x += 0.00015;

    // Subtle parallax follow
    camera.position.x += (mouseX * 60 - camera.position.x) * 0.04;
    camera.position.y += (-mouseY * 40 - camera.position.y) * 0.04;
    camera.lookAt(scene.position);

    // Pulse opacity — 1/3 original speed
    mat.opacity = 0.45 + Math.sin(frame * 0.00267) * 0.1;

    renderer.render(scene, camera);
  }
  animate();

  // Stop WebGL when hero is far out of view (perf)
  const hero = $('#hero');
  if (hero) {
    const obs = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
      if (running) animate();
    }, { rootMargin: '200px' });
    obs.observe(hero);
  }

  initNeonLogo();
}

/* --------------------------------------------------------------------------
   5b. NEON LOGO — WebGL "Neural Line" shader on spartan.png
       Converts white/light pixels into living cyan neon with volumetric glow.
   -------------------------------------------------------------------------- */
function initNeonLogo() {
  const canvas = $('#logo-neon-canvas');
  if (!canvas) return;

  const CANVAS_SIZE = 512;
  canvas.width  = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;

  initLogoRotate();

  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false })
          || canvas.getContext('experimental-webgl', { alpha: true, premultipliedAlpha: false });
  if (!gl) return;

  gl.viewport(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  /* ---- Shaders ---- */
  const VERT = `
    attribute vec2 a_pos;
    varying vec2 v_uv;
    void main() {
      v_uv = (a_pos + 1.0) * 0.5;
      gl_Position = vec4(a_pos, 0.0, 1.0);
    }
  `;

  /* Neural Line fragment shader
     - Three glow radii: tight core / mid / wide diffuse
     - Animated shimmer (high-freq) + slow global pulse
     - Deep cobalt background with subtle vignette
  */
  const FRAG = `
    precision mediump float;
    varying vec2 v_uv;
    uniform sampler2D u_tex;
    uniform float u_time;
    uniform float u_px;   /* 1.0 / CANVAS_SIZE */

    float luma(vec4 c) {
      return dot(c.rgb, vec3(0.299, 0.587, 0.114)) * c.a;
    }

    /* 8-tap circular sample at radius r (in UV units) */
    float ring(vec2 uv, float r) {
      float v = 0.0;
      v += luma(texture2D(u_tex, uv + vec2( r,      0.0  )));
      v += luma(texture2D(u_tex, uv + vec2(-r,      0.0  )));
      v += luma(texture2D(u_tex, uv + vec2( 0.0,    r    )));
      v += luma(texture2D(u_tex, uv + vec2( 0.0,   -r    )));
      v += luma(texture2D(u_tex, uv + vec2( 0.707*r,  0.707*r)));
      v += luma(texture2D(u_tex, uv + vec2(-0.707*r,  0.707*r)));
      v += luma(texture2D(u_tex, uv + vec2( 0.707*r, -0.707*r)));
      v += luma(texture2D(u_tex, uv + vec2(-0.707*r, -0.707*r)));
      return v / 8.0;
    }

    void main() {
      vec2 uv = v_uv;

      /* Center brightness */
      float core  = luma(texture2D(u_tex, uv));

      /* Layered glow at 3 radii */
      float g1 = ring(uv, u_px *  3.5);   /* tight halo   */
      float g2 = ring(uv, u_px * 12.0);   /* mid bloom    */
      float g3 = ring(uv, u_px * 28.0);   /* wide diffuse */

      /* Animated shimmer — flickers along lines */
      float shimmer = 0.82 + 0.18 * sin(u_time * 3.2 + uv.x * 14.0 - uv.y * 11.0);

      /* Slow global breath */
      float breath  = 0.91 + 0.09 * sin(u_time * 0.9);

      /* Glow palette (website cyan / blue) */
      vec3 colWide = vec3(0.0,  0.28, 0.88);   /* cobalt-blue outer */
      vec3 colMid  = vec3(0.0,  0.75, 1.0 );   /* cyan mid          */
      /* Core shifts toward white-cyan on bright pixels (the glimmer) */
      vec3 colCore = mix(
        vec3(0.0,  0.88, 1.0 ),   /* cyan core          */
        vec3(0.52, 1.0,  1.0 ),   /* white-cyan glimmer */
        core * shimmer
      );

      /* Compose glow layers — no opaque background so canvas is transparent */
      vec3 col = vec3(0.0);
      col += colWide * g3 * 1.6  * breath;
      col += colMid  * g2 * 3.0  * breath;
      col += colMid  * g1 * 4.5  * breath;
      col += colCore * core * 3.5 * shimmer;
      col = min(col, vec3(1.0));

      /* Alpha from glow luminance — dark pixels transparent, bright pixels opaque */
      float lum = dot(col, vec3(0.299, 0.587, 0.114));
      float alpha = clamp(lum * 2.5, 0.0, 1.0);

      gl_FragColor = vec4(col, alpha);
    }
  `;

  function mkShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, mkShader(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);

  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn('Neon logo shader link failed:', gl.getProgramInfoLog(prog));
    return;
  }

  gl.useProgram(prog);

  /* Fullscreen quad */
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uTex  = gl.getUniformLocation(prog, 'u_tex');
  const uPx   = gl.getUniformLocation(prog, 'u_px');

  gl.uniform1i(uTex, 0);
  gl.uniform1f(uPx, 1.0 / CANVAS_SIZE);
  gl.clearColor(0, 0, 0, 0);

  /* Load spartan.png → WebGL texture */
  const tex = gl.createTexture();
  const img = new Image();
  img.crossOrigin = 'anonymous';

  img.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    let neonRunning = true;
    const t0 = performance.now();

    function neonLoop() {
      if (!neonRunning) return;
      requestAnimationFrame(neonLoop);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTime, (performance.now() - t0) / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    neonLoop();

    const heroEl = $('#hero');
    if (heroEl) {
      new IntersectionObserver(([e]) => {
        neonRunning = e.isIntersecting;
        if (neonRunning) neonLoop();
      }, { rootMargin: '200px' }).observe(heroEl);
    }
  };

  img.onerror = () => {
    /* Fallback: static image with CSS neon filter */
    const fb = document.createElement('img');
    fb.src = 'assets/images/spartan.webp';
    fb.alt = 'Warrior of God Tactical';
    fb.className = 'hero-logo-canvas hero-logo-fallback';
    canvas.replaceWith(fb);
  };

  img.src = 'assets/images/spartan.webp';
}

/* --------------------------------------------------------------------------
   5c. FOOTER NEON LOGO — same shader as hero, 128px canvas
   -------------------------------------------------------------------------- */
function initFooterNeonLogo() {
  const canvas = $('#footer-neon-canvas');
  if (!canvas) return;

  const SZ = 128;
  canvas.width  = SZ;
  canvas.height = SZ;

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) { canvas.style.display = 'none'; return; }

  gl.viewport(0, 0, SZ, SZ);

  const VERT = `attribute vec2 a_pos;varying vec2 v_uv;void main(){v_uv=(a_pos+1.0)*0.5;gl_Position=vec4(a_pos,0.0,1.0);}`;
  const FRAG = `
    precision mediump float;
    varying vec2 v_uv;
    uniform sampler2D u_tex;
    uniform float u_time;
    uniform float u_px;
    float luma(vec4 c){return dot(c.rgb,vec3(0.299,0.587,0.114))*c.a;}
    float ring(vec2 uv,float r){
      float v=0.0;
      v+=luma(texture2D(u_tex,uv+vec2(r,0.0)));
      v+=luma(texture2D(u_tex,uv+vec2(-r,0.0)));
      v+=luma(texture2D(u_tex,uv+vec2(0.0,r)));
      v+=luma(texture2D(u_tex,uv+vec2(0.0,-r)));
      v+=luma(texture2D(u_tex,uv+vec2(0.707*r,0.707*r)));
      v+=luma(texture2D(u_tex,uv+vec2(-0.707*r,0.707*r)));
      v+=luma(texture2D(u_tex,uv+vec2(0.707*r,-0.707*r)));
      v+=luma(texture2D(u_tex,uv+vec2(-0.707*r,-0.707*r)));
      return v/8.0;
    }
    void main(){
      vec2 uv=v_uv;
      float core=luma(texture2D(u_tex,uv));
      float g1=ring(uv,u_px*3.5);
      float g2=ring(uv,u_px*12.0);
      float g3=ring(uv,u_px*28.0);
      float shimmer=0.82+0.18*sin(u_time*3.2+uv.x*14.0-uv.y*11.0);
      float breath=0.91+0.09*sin(u_time*0.9);
      float vig=1.0-length(uv-0.5)*1.15;
      vig=clamp(vig,0.0,1.0);
      vec3 bg=vec3(0.008,0.025,0.14)*vig;
      vec3 colWide=vec3(0.0,0.28,0.88);
      vec3 colMid=vec3(0.0,0.75,1.0);
      vec3 colCore=mix(vec3(0.0,0.88,1.0),vec3(0.52,1.0,1.0),core*shimmer);
      vec3 col=bg;
      col+=colWide*g3*1.6*breath;
      col+=colMid*g2*3.0*breath;
      col+=colMid*g1*4.5*breath;
      col+=colCore*core*3.5*shimmer;
      col=min(col,vec3(1.0));
      gl_FragColor=vec4(col,1.0);
    }
  `;

  function mkShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s); return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, mkShader(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.style.display='none'; return; }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uTex  = gl.getUniformLocation(prog, 'u_tex');
  const uPx   = gl.getUniformLocation(prog, 'u_px');
  gl.uniform1i(uTex, 0);
  gl.uniform1f(uPx, 1.0 / SZ);
  gl.clearColor(0, 0.025, 0.14, 1);

  const tex = gl.createTexture();
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    let running = true;
    const t0 = performance.now();
    function loop() {
      if (!running) return;
      requestAnimationFrame(loop);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTime, (performance.now() - t0) / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    loop();

    const footer = $('#site-footer');
    if (footer) {
      new IntersectionObserver(([e]) => {
        running = e.isIntersecting;
        if (running) loop();
      }, { rootMargin: '200px' }).observe(footer);
    }
  };
  img.onerror = () => { canvas.style.display = 'none'; };
  img.src = 'assets/images/spartan.webp';
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

  function waitForProducts(cb) {
    if (typeof WOG_PRODUCTS !== 'undefined') { cb(); return; }
    const t = setInterval(() => {
      if (typeof WOG_PRODUCTS !== 'undefined') { clearInterval(t); cb(); }
    }, 40);
  }

  waitForProducts(() => {
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
  });
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
   12. FOOTER YEAR
   -------------------------------------------------------------------------- */
function initFooterYear() {
  const el = $('#footer-year');
  if (el) el.textContent = new Date().getFullYear();
}
