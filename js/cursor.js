/**
 * Polyglot Celestial Astrolabe Cursor
 * Santhosh S. — Multilingual Educator Portfolio
 * 
 * Features:
 * 1. 5 Planetary Language Satellites (Tamil, English, Malayalam, German, Japanese)
 * 2. Precision Central Jewel Dot (immediate zero-latency tracking)
 * 3. Fluid Lerped Outer Astrolabe Reticle with 4 Cardinal Viewfinder Notches
 * 4. Contextual Aerospace Polyglot HUD with Smart Viewport Edge-Flipping
 * 5. Pentagonal Linguistic Burst on Click (5 signature glyphs burst in a celestial star formation)
 * 6. Fullscreen Stardust Sparks Canvas with ambient stardust motes
 * 7. Responsive Fallback: completely disabled on touch and coarse pointer devices
 */

const CURSOR_LANGUAGES = [
  { id: 'tamil', glyph: 'த', name: 'TAMIL', script: 'தமிழ்', ipa: '/t̪ɐmɨɻ/', tag: '13.08° N · BEDROCK' },
  { id: 'english', glyph: 'EN', name: 'ENGLISH', script: 'GLOBAL', ipa: "/'ɪŋglɪʃ/", tag: 'WORLD LINGUA FRANCA' },
  { id: 'malayalam', glyph: 'മ', name: 'MALAYALAM', script: 'മലയാളം', ipa: '/mɐlɐjaːɭɐm/', tag: 'HERITAGE · CADENCE' },
  { id: 'german', glyph: 'DE', name: 'GERMAN', script: 'DEUTSCH', ipa: '/dɔʏtʃ/', tag: '51.16° N · IMMERSION' },
  { id: 'japanese', glyph: '日', name: 'JAPANESE', script: '日本語', ipa: '/nihongo/', tag: 'EAST ASIA · ETIQUETTE' }
];

export class PolyglotCursor {
  constructor() {
    // Graceful bailout on mobile / touch or prefers-reduced-motion
    if (window.matchMedia('(hover: none) or (pointer: coarse)').matches) return;

    this.mouse = { x: -200, y: -200, lastX: -200, lastY: -200, speed: 0 };
    this.dot = { x: -200, y: -200 };
    this.ring = { x: -200, y: -200 };
    this.hud = { x: -200, y: -200 };

    this.orbitAngle = 0;
    this.orbitRadius = 24;
    this.targetRadius = 24;

    this.isHovering = false;
    this.isClicking = false;
    this.isVisible = false;
    this.isCustomLocked = false;

    this.ambientIndex = 0;
    this.ambientTimer = null;

    this.particles = [];
    this.maxParticles = 50;

    this.initDOM();
    this.initCanvas();
    this.bindEvents();
    this.startAmbientCycle();
    this.startRenderLoop();
  }

  initDOM() {
    this.container = document.createElement('div');
    this.container.className = 'polyglot-cursor-container';
    this.container.setAttribute('aria-hidden', 'true');

    // Stardust Canvas
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'cursor-stardust-canvas';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    // Central Precision Dot
    this.dotEl = document.createElement('div');
    this.dotEl.className = 'cursor-center-dot';
    this.container.appendChild(this.dotEl);

    // Reticle Ring & Notches
    this.reticleEl = document.createElement('div');
    this.reticleEl.className = 'cursor-reticle-ring';

    ['top', 'right', 'bottom', 'left'].forEach((pos) => {
      const notch = document.createElement('span');
      notch.className = `cursor-notch notch-${pos}`;
      this.reticleEl.appendChild(notch);
    });

    // Orbit Track Container
    this.orbitTrack = document.createElement('div');
    this.orbitTrack.className = 'cursor-orbit-track';

    this.satelliteEls = [];
    CURSOR_LANGUAGES.forEach((lang, index) => {
      const sat = document.createElement('div');
      sat.className = `cursor-satellite sat-${lang.id}`;
      sat.dataset.langId = lang.id;
      sat.title = `${lang.name} (${lang.script})`;

      const glyphSpan = document.createElement('span');
      glyphSpan.className = 'satellite-glyph';
      glyphSpan.textContent = lang.glyph;
      sat.appendChild(glyphSpan);

      this.orbitTrack.appendChild(sat);
      this.satelliteEls.push({ el: sat, data: lang, index });
    });
    this.reticleEl.appendChild(this.orbitTrack);

    // Shockwave pulse
    this.shockwaveEl = document.createElement('div');
    this.shockwaveEl.className = 'cursor-shockwave-pulse';
    this.reticleEl.appendChild(this.shockwaveEl);

    this.container.appendChild(this.reticleEl);

    // Aerospace HUD Tag
    this.hudEl = document.createElement('div');
    this.hudEl.className = 'cursor-telemetry-hud';

    const pip = document.createElement('div');
    pip.className = 'hud-status-pip';
    this.hudEl.appendChild(pip);

    const hudContent = document.createElement('div');
    hudContent.className = 'hud-content';

    this.hudPrimary = document.createElement('span');
    this.hudPrimary.className = 'hud-primary-text';
    this.hudPrimary.textContent = 'TAMIL · தமிழ்';

    this.hudSecondary = document.createElement('span');
    this.hudSecondary.className = 'hud-secondary-text';
    this.hudSecondary.textContent = '13.08° N · BEDROCK';

    hudContent.appendChild(this.hudPrimary);
    hudContent.appendChild(this.hudSecondary);
    this.hudEl.appendChild(hudContent);

    this.container.appendChild(this.hudEl);

    document.body.appendChild(this.container);
  }

  initCanvas() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas(), { passive: true });
  }

  resizeCanvas() {
    if (!this.canvas) return;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * this.dpr;
    this.canvas.height = window.innerHeight * this.dpr;
    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;
    if (this.ctx) {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(this.dpr, this.dpr);
    }
  }

  bindEvents() {
    window.addEventListener('mousemove', (e) => {
      if (!this.isVisible) {
        this.isVisible = true;
        this.container.classList.add('is-visible');
      }

      this.mouse.lastX = this.mouse.x;
      this.mouse.lastY = this.mouse.y;
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;

      const dx = this.mouse.x - this.mouse.lastX;
      const dy = this.mouse.y - this.mouse.lastY;
      this.mouse.speed = Math.sqrt(dx * dx + dy * dy);

      // Ambient stardust motes when moving fast
      if (this.mouse.speed > 8 && Math.random() < 0.3) {
        this.spawnMotionMote(this.mouse.x, this.mouse.y);
      }
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      this.isVisible = false;
      this.container.classList.remove('is-visible');
    });

    document.addEventListener('mouseenter', () => {
      this.isVisible = true;
      this.container.classList.add('is-visible');
    });

    // Mousedown / Mouseup Tactile Shockwave & 5 Languages Pentagonal Burst
    window.addEventListener('mousedown', (e) => {
      this.isClicking = true;
      this.container.classList.add('is-clicking');

      // Trigger shockwave animation
      this.shockwaveEl.classList.remove('trigger-pulse');
      void this.shockwaveEl.offsetWidth; // Force reflow
      this.shockwaveEl.classList.add('trigger-pulse');

      // Pentagonal burst of all 5 language signatures!
      this.spawnPentagonalBurst(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', () => {
      this.isClicking = false;
      this.container.classList.remove('is-clicking');
    });

    // Intelligent Contextual Hover Detection
    const hoverables = 'a, button, [role="button"], input, select, textarea, .language-card, .pillar-card, .institution-card, .timeline-step, .discipline-card, #sphere, .btn-luxury, .magnetic-btn';

    document.addEventListener('mouseover', (e) => {
      const target = e.target;

      // 1. Language Card Hover
      const langCard = target.closest('[data-lang-id]');
      if (langCard) {
        const langId = langCard.dataset.langId;
        const langData = CURSOR_LANGUAGES.find(l => l.id === langId);
        if (langData) {
          this.setLockedLanguage(langData);
          this.setHoverState(true, 36);
          return;
        }
      }

      // 2. 3D Sphere Canvas Hover
      if (target.closest('#sphere') || target.closest('.canvas-frame')) {
        this.setCustomHUD('ASTROLABE · 3D', '360° CELESTIAL ORBIT');
        this.setHoverState(true, 32);
        return;
      }

      // 3. CTA Buttons & Interactive Links
      const btn = target.closest('.btn-luxury, .btn-primary, [data-magnetic="true"]');
      if (btn) {
        const text = btn.textContent.trim().toLowerCase();
        if (text.includes('conversation') || text.includes('contact') || text.includes('connect')) {
          this.setCustomHUD('CONNECT · உரையாடல்', 'TRANSCONTINENTAL DIALOGUE');
        } else {
          this.setCustomHUD('ACTION · ENGAGE', 'PREVIEW SPECIFICATION');
        }
        this.setHoverState(true, 38);
        return;
      }

      // 4. General Hoverables
      if (target.closest(hoverables)) {
        this.setHoverState(true, 32);
      }
    });

    document.addEventListener('mouseout', (e) => {
      const currentLangCard = e.target.closest('[data-lang-id]');
      const nextLangCard = e.relatedTarget ? e.relatedTarget.closest('[data-lang-id]') : null;

      if (currentLangCard && !nextLangCard) {
        this.clearLockedLanguage();
      }

      const currentHoverable = e.target.closest(hoverables);
      const nextHoverable = e.relatedTarget ? e.relatedTarget.closest(hoverables) : null;

      if (currentHoverable && !nextHoverable) {
        this.setHoverState(false, 24);
        if (!nextLangCard) {
          this.clearLockedLanguage();
        }
      }
    });
  }

  setHoverState(isHovered, targetRadius = 24) {
    this.isHovering = isHovered;
    this.targetRadius = targetRadius;
    if (isHovered) {
      this.container.classList.add('is-hovering');
    } else {
      this.container.classList.remove('is-hovering');
    }
  }

  setActiveLanguage(langId) {
    const langIndex = CURSOR_LANGUAGES.findIndex(l => l.id === langId);
    if (langIndex !== -1) {
      this.ambientIndex = langIndex;
      this.currentLangId = langId;
      if (!this.isCustomLocked) {
        this.applyAmbientLanguage(langIndex);
      }
    }
  }

  setLockedLanguage(langData) {
    this.isCustomLocked = true;
    this.hudPrimary.textContent = `${langData.name} · ${langData.script}`;
    this.hudSecondary.textContent = `${langData.ipa} · ${langData.tag}`;
    this.highlightSatellite(langData.id);
  }

  clearLockedLanguage() {
    this.isCustomLocked = false;
    this.applyAmbientLanguage(this.ambientIndex);
  }

  setCustomHUD(primary, secondary) {
    this.isCustomLocked = true;
    this.hudPrimary.textContent = primary;
    this.hudSecondary.textContent = secondary;
  }

  highlightSatellite(langId) {
    this.satelliteEls.forEach(sat => {
      if (sat.data.id === langId) {
        sat.el.classList.add('is-highlighted');
      } else {
        sat.el.classList.remove('is-highlighted');
      }
    });
  }

  startAmbientCycle() {
    this.applyAmbientLanguage(0);
    this.ambientTimer = setInterval(() => {
      if (this.isCustomLocked || this.isHovering) return;
      this.ambientIndex = (this.ambientIndex + 1) % CURSOR_LANGUAGES.length;
      this.applyAmbientLanguage(this.ambientIndex);
    }, 3600);
  }

  applyAmbientLanguage(index) {
    const lang = CURSOR_LANGUAGES[index];
    if (!lang) return;

    this.hudPrimary.textContent = `${lang.name} · ${lang.script}`;
    this.hudSecondary.textContent = lang.tag;

    this.satelliteEls.forEach((sat, i) => {
      if (i === index) {
        sat.el.classList.add('is-active');
      } else {
        sat.el.classList.remove('is-active');
      }
    });
  }

  /**
   * Signature Pentagonal 5-Language Burst
   * Discharges each of the 5 language glyphs in a radiant star formation
   */
  spawnPentagonalBurst(x, y) {
    const count = CURSOR_LANGUAGES.length;
    const baseAngle = -Math.PI / 2; // North start

    for (let i = 0; i < count; i++) {
      const lang = CURSOR_LANGUAGES[i];
      const angle = baseAngle + (i * ((Math.PI * 2) / count));
      const speed = 2.4 + Math.random() * 0.8;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        decay: 0.022,
        size: 11,
        char: lang.glyph,
        colorBase: i % 2 === 0 ? 'rgba(183, 149, 91, ' : 'rgba(82, 199, 154, ',
        isGlyph: true
      });

      // Complementary star mote between glyphs
      const midAngle = angle + (Math.PI / count);
      this.particles.push({
        x,
        y,
        vx: Math.cos(midAngle) * (speed * 0.75),
        vy: Math.sin(midAngle) * (speed * 0.75),
        alpha: 0.9,
        decay: 0.03,
        size: 7,
        char: '✦',
        colorBase: 'rgba(244, 240, 232, ',
        isGlyph: false
      });
    }
  }

  spawnMotionMote(x, y) {
    if (this.particles.length >= this.maxParticles) {
      this.particles.shift();
    }

    const motes = ['✦', '·', '✧', '•'];
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.5 + Math.random() * 1.2;

    this.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.3,
      alpha: 0.85,
      decay: 0.028,
      size: 7 + Math.random() * 3,
      char: motes[Math.floor(Math.random() * motes.length)],
      colorBase: 'rgba(183, 149, 91, ',
      isGlyph: false
    });
  }

  updateParticles() {
    if (!this.ctx || this.particles.length === 0) return;

    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.95;
      p.vy *= 0.95;
      p.alpha -= p.decay;

      if (p.alpha <= 0.02) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      const fontFace = p.isGlyph
        ? '"Playfair Display", "Noto Sans Tamil", "Noto Sans Malayalam", "Noto Sans JP", sans-serif'
        : '"DM Mono", monospace';
      this.ctx.font = `600 ${p.size}px ${fontFace}`;
      this.ctx.fillStyle = `${p.colorBase}${p.alpha})`;
      this.ctx.shadowColor = `${p.colorBase}${p.alpha * 0.85})`;
      this.ctx.shadowBlur = p.isGlyph ? 8 : 4;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(p.char, p.x, p.y);
      this.ctx.restore();
    }
  }

  startRenderLoop() {
    const render = () => {
      // 1. Lerp Radius towards target
      this.orbitRadius += (this.targetRadius - this.orbitRadius) * 0.12;

      // 2. Center Dot tracks instantly (zero latency)
      if (this.isVisible) {
        this.dotEl.style.transform = `translate3d(${this.mouse.x}px, ${this.mouse.y}px, 0) translate(-50%, -50%)`;

        // 3. Reticle smoothly lerps
        const lerpFactor = 0.18;
        this.ring.x += (this.mouse.x - this.ring.x) * lerpFactor;
        this.ring.y += (this.mouse.y - this.ring.y) * lerpFactor;
        this.reticleEl.style.transform = `translate3d(${this.ring.x}px, ${this.ring.y}px, 0) translate(-50%, -50%)`;

        // 4. Orbit rotation & positioning satellites
        const speed = this.isHovering ? 0.028 : 0.014;
        this.orbitAngle += speed;

        const count = this.satelliteEls.length;
        const step = (Math.PI * 2) / count;

        for (let i = 0; i < count; i++) {
          const sat = this.satelliteEls[i];
          const a = this.orbitAngle + (i * step);
          const sx = Math.cos(a) * this.orbitRadius;
          const sy = Math.sin(a) * this.orbitRadius;
          const isSpecial = sat.el.classList.contains('is-active') || sat.el.classList.contains('is-highlighted');
          const scale = isSpecial ? 1.25 : 1.0;

          // translate3d places the satellite on the orbit circle while keeping glyph upright
          sat.el.style.transform = `translate3d(${sx}px, ${sy}px, 0) translate(-50%, -50%) scale(${scale})`;
        }

        // 5. Aerospace Telemetry HUD smoothly floats beside cursor with edge-flip avoidance
        const hudLerp = 0.12;
        const isNearRightEdge = this.mouse.x > (window.innerWidth - 180);
        const targetHudX = isNearRightEdge ? (this.mouse.x - 145) : (this.mouse.x + 24);
        const targetHudY = this.mouse.y + 16;
        this.hud.x += (targetHudX - this.hud.x) * hudLerp;
        this.hud.y += (targetHudY - this.hud.y) * hudLerp;
        this.hudEl.style.transform = `translate3d(${this.hud.x}px, ${this.hud.y}px, 0)`;
      }

      // 6. Update canvas stardust particles
      this.updateParticles();

      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  }
}
