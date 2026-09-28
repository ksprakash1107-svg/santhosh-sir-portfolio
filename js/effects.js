/**
 * Haute-Couture Visual Effects & Interaction Physics
 * Santhosh S. — Personal Brand Portfolio
 * 
 * 1. LinguisticConstellation: Interactive particle nebula with 5-script glyphs
 * 2. MagneticButton: Spring-physics cursor magnetism for luxury buttons
 * 3. PolyglotCipher: Linguistic decryption & glyph morphing effect
 * 4. CardTiltEffect: Mathematical 3D perspective card tilt with specular light
 */

// ============================================================
// 1. CELESTIAL LINGUISTIC CONSTELLATION (HERO CANVAS)
// ============================================================

export class LinguisticConstellation {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    this.glyphs = ["த", "EN", "മ", "DE", "語", "α", "λ", "§", "文", "Cadence", "13°N", "51°N"];
    this.particles = [];
    this.particleCount = 38;
    this.maxDistance = 140;
    this.mouse = { x: -1000, y: -1000, active: false };
    this.isRunning = false;
    this.rafId = null;

    this.init();
  }

  init() {
    this.resize();
    this.createParticles();
    this.bindEvents();
    this.initObserver();
  }

  resize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      const isGlyph = i % 3 === 0;
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        size: isGlyph ? 10 : Math.random() * 2 + 1.2,
        isGlyph: isGlyph,
        glyph: this.glyphs[i % this.glyphs.length],
        alpha: Math.random() * 0.45 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseVal: Math.random() * Math.PI
      });
    }
  }

  bindEvents() {
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.resize();
        this.createParticles();
      }, 150);
    }, { passive: true });

    const hero = this.canvas.closest('.hero-section') || document.body;

    hero.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      this.mouse.active = true;
    }, { passive: true });

    hero.addEventListener('mouseleave', () => {
      this.mouse.active = false;
    });
  }

  initObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.start();
        } else {
          this.stop();
        }
      });
    }, { threshold: 0.05 });

    observer.observe(this.canvas);
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.tick();
    }
  }

  stop() {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  tick() {
    if (!this.isRunning) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    // Update & draw particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Natural drift
      p.x += p.vx;
      p.y += p.vy;

      // Wrap edges
      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;

      // Mouse subtle gravity
      if (this.mouse.active) {
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180 && dist > 1) {
          const force = (1 - dist / 180) * 0.35;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }
      }

      // Breathing opacity
      p.pulseVal += p.pulseSpeed;
      const currentAlpha = p.alpha * (0.8 + Math.sin(p.pulseVal) * 0.2);

      // Render
      if (p.isGlyph) {
        this.ctx.font = '500 11px "Noto Sans Tamil", "Noto Sans JP", "DM Mono", monospace';
        this.ctx.fillStyle = `rgba(183, 149, 91, ${currentAlpha * 0.75})`;
        this.ctx.fillText(p.glyph, p.x, p.y);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(244, 240, 232, ${currentAlpha * 0.6})`;
        this.ctx.fill();
      }

      // Constellation lines to neighbors
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.maxDistance) {
          const lineAlpha = (1 - dist / this.maxDistance) * 0.16;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(183, 149, 91, ${lineAlpha})`;
          this.ctx.lineWidth = 0.8;
          this.ctx.stroke();
        }
      }
    }

    this.rafId = requestAnimationFrame(() => this.tick());
  }
}

// ============================================================
// 2. MAGNETIC SPRING PHYSICS FOR LUXURY BUTTONS
// ============================================================

export class MagneticButtonController {
  constructor() {
    if (window.matchMedia('(hover: none) or (pointer: coarse)').matches) return;
    window.__magneticController = this;
    this.init();
  }

  init() {
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .header-cta-btn, .external-link-btn');
    buttons.forEach(btn => this.bindButton(btn));
  }

  bindButton(btn) {
    if (!btn || btn.__magneticBound) return;
    btn.__magneticBound = true;

    let isHovered = false;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId = null;

    const springTick = () => {
      currentX += (targetX - currentX) * 0.22;
      currentY += (targetY - currentY) * 0.22;

      btn.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;

      if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1 || isHovered) {
        rafId = requestAnimationFrame(springTick);
      } else {
        btn.style.transform = '';
        rafId = null;
      }
    };

    btn.addEventListener('mousemove', (e) => {
      isHovered = true;
      const rect = btn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      targetX = (e.clientX - centerX) * 0.28;
      targetY = (e.clientY - centerY) * 0.28;

      const px = ((e.clientX - rect.left) / rect.width) * 100;
      const py = ((e.clientY - rect.top) / rect.height) * 100;
      btn.style.setProperty('--mouse-x', `${px}%`);
      btn.style.setProperty('--mouse-y', `${py}%`);

      if (!rafId) {
        rafId = requestAnimationFrame(springTick);
      }
    });

    btn.addEventListener('mouseleave', () => {
      isHovered = false;
      targetX = 0;
      targetY = 0;
    });
  }
}

// ============================================================
// 3. POLYGLOT GLYPH DECRYPTION / LINGUISTIC CIPHER EFFECT
// ============================================================

export class PolyglotCipher {
  constructor() {
    this.cipherPool = "தகசபமযരലவഷஸஐநabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZäöüß0123456789日本語東京言語";
    this.init();
  }

  init() {
    // 1. Hover cipher on language cards and titles
    const targets = document.querySelectorAll('.lang-english-title, .section-kicker, .hero-eyebrow, [data-cipher]');

    targets.forEach(el => {
      const originalText = el.textContent.trim();
      el.setAttribute('data-original-text', originalText);

      el.addEventListener('mouseenter', () => {
        this.scramble(el, originalText);
      });
    });
  }

  scramble(element, finalString, duration = 650) {
    if (element.__scrambling) return;
    element.__scrambling = true;

    const length = finalString.length;
    const startTime = performance.now();

    element.classList.add('cipher-scrambling');

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const revealedCount = Math.floor(progress * length);

      let scrambled = "";
      for (let i = 0; i < length; i++) {
        if (finalString[i] === " " || finalString[i] === "·" || finalString[i] === "—") {
          scrambled += finalString[i];
        } else if (i < revealedCount) {
          scrambled += finalString[i];
        } else {
          scrambled += this.cipherPool[Math.floor(Math.random() * this.cipherPool.length)];
        }
      }

      element.textContent = scrambled;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = finalString;
        element.classList.remove('cipher-scrambling');
        element.__scrambling = false;
      }
    };

    requestAnimationFrame(update);
  }
}

// ============================================================
// 4. MATHEMATICAL 3D PERSPECTIVE CARD TILT & SPECULAR LIGHT
// ============================================================

export class CardTiltEffect {
  constructor() {
    if (window.matchMedia('(hover: none) or (pointer: coarse)').matches) return;
    this.init();
  }

  init() {
    const cards = document.querySelectorAll('.language-card, .institution-card, .pillar-card, .timeline-step, .contact-card, .metric-block');

    cards.forEach(card => {
      card.classList.add('tilt-card');

      // Create specular glare overlay if missing
      let glare = card.querySelector('.card-specular-glare');
      if (!glare) {
        glare = document.createElement('div');
        glare.className = 'card-specular-glare';
        card.appendChild(glare);
      }

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const normX = (x / rect.width) * 2 - 1;
        const normY = (y / rect.height) * 2 - 1;

        // Subtle 3D tilt
        const rotX = (-normY * 7).toFixed(2);
        const rotY = (normX * 7).toFixed(2);

        card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.015, 1.015, 1.015)`;

        // Specular light position
        const px = ((x / rect.width) * 100).toFixed(1);
        const py = ((y / rect.height) * 100).toFixed(1);
        glare.style.setProperty('--glare-x', `${px}%`);
        glare.style.setProperty('--glare-y', `${py}%`);
        glare.style.setProperty('--glare-opacity', '1');
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        glare.style.setProperty('--glare-opacity', '0');
      });
    });
  }
}

// ============================================================
// 5. POLYGLOT GENESIS PRELOADER CONTROLLER
// ============================================================

export class PolyglotPreloader {
  constructor() {
    this.preloader = document.getElementById('app-preloader');
    if (!this.preloader) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.dismiss(true);
      return;
    }

    this.counterEl = document.getElementById('preloader-lang-counter');
    this.greetingTextEl = document.getElementById('preloader-greeting-text');
    this.percentEl = document.getElementById('preloader-percent');
    this.fillEl = document.getElementById('preloader-progress-fill');
    this.skipBtn = document.getElementById('preloader-skip-btn');

    this.steps = [
      { num: '01 / 05', script: 'வணக்கம்', phonetic: 'Tamil · Vanakkam', progress: 18 },
      { num: '02 / 05', script: 'Willkommen', phonetic: 'Deutsch · Welcome', progress: 38 },
      { num: '03 / 05', script: 'നമസ്കാരം', phonetic: 'Malayalam · Namaskaram', progress: 58 },
      { num: '04 / 05', script: 'ようこそ', phonetic: 'Japanese · Yokoso', progress: 76 },
      { num: '05 / 05', script: 'Welcome', phonetic: 'English · Welcome', progress: 92 },
      { num: '05 / 05', script: 'LANGUAGE HAS NO BORDER', phonetic: 'Santhosh S. · 13°N ↔ 51°N', progress: 100 }
    ];

    this.currentIndex = 0;
    this.isExited = false;
    this.init();
  }

  init() {
    if (this.skipBtn) {
      this.skipBtn.addEventListener('click', () => this.dismiss());
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.isExited) this.dismiss();
    });

    // Animate progress smoothly through steps
    const stepDuration = 340;
    let step = 0;

    const intervalId = setInterval(() => {
      if (this.isExited) {
        clearInterval(intervalId);
        return;
      }

      step++;
      if (step < this.steps.length) {
        this.renderStep(this.steps[step], false);
      } else {
        clearInterval(intervalId);
        setTimeout(() => this.dismiss(), 350);
      }
    }, stepDuration);

    // Initial render immediately visible
    this.renderStep(this.steps[0], true);

    // Safety fallback: dismiss within max 2.6 seconds no matter what
    setTimeout(() => {
      if (!this.isExited) this.dismiss();
    }, 2600);
  }

  renderStep(item, isInitial = false) {
    if (!item) return;

    if (this.counterEl) {
      this.counterEl.textContent = item.num;
    }

    if (this.percentEl) {
      this.percentEl.textContent = `${String(item.progress).padStart(2, '0')}%`;
    }

    if (this.fillEl) {
      this.fillEl.style.width = `${item.progress}%`;
    }

    if (!this.greetingTextEl) return;

    const isAxiom = item.progress === 100;
    const content = `
      <span class="preloader-script" style="${isAxiom ? 'font-size: clamp(1.1rem, 1rem + 0.8vw, 1.55rem); letter-spacing: 0.12em;' : ''}">${item.script}</span>
      <span class="preloader-phonetic">${item.phonetic}</span>
    `;

    if (isInitial) {
      this.greetingTextEl.innerHTML = content;
      this.greetingTextEl.style.opacity = '1';
      this.greetingTextEl.style.transform = 'translateY(0)';
      return;
    }

    this.greetingTextEl.style.opacity = '0';
    this.greetingTextEl.style.transform = 'translateY(-6px)';

    setTimeout(() => {
      this.greetingTextEl.innerHTML = content;
      this.greetingTextEl.style.opacity = '1';
      this.greetingTextEl.style.transform = 'translateY(0)';
    }, 70);
  }

  dismiss(immediate = false) {
    if (this.isExited) return;
    this.isExited = true;

    if (immediate) {
      this.preloader.classList.add('is-hidden');
      this.preloader.setAttribute('aria-hidden', 'true');
      return;
    }

    this.preloader.classList.add('is-exiting');
    this.preloader.setAttribute('aria-hidden', 'true');

    setTimeout(() => {
      this.preloader.classList.add('is-hidden');
    }, 850);
  }
}

// ============================================================
// 6. FOOTER TEXT HOVER EFFECT (INTERACTIVE SPOTLIGHT SIGNATURE)
// ============================================================

export class FooterTextHoverEffect {
  constructor(wrapId = 'footer-hover-wrap') {
    this.wrap = document.getElementById(wrapId);
    if (!this.wrap) return;

    this.svg = document.getElementById('footer-text-hover-svg');
    this.mask = document.getElementById('footerRevealMask');
    this.animatedStroke = this.svg?.querySelector('.footer-svg-stroke-animated');
    if (!this.svg || !this.mask) return;

    this.currentX = 50;
    this.currentY = 50;
    this.targetX = 50;
    this.targetY = 50;
    this.isHovered = false;
    this.rafId = null;

    this.init();
  }

  init() {
    this.bindEvents();
    this.initObserver();
    this.startLoop();
  }

  bindEvents() {
    this.wrap.addEventListener('mousemove', (e) => {
      const rect = this.svg.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      this.isHovered = true;
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      this.targetX = Math.max(0, Math.min(100, x));
      this.targetY = Math.max(0, Math.min(100, y));
    }, { passive: true });

    this.wrap.addEventListener('mouseenter', () => {
      this.isHovered = true;
      this.mask.setAttribute('r', '26%');
    });

    this.wrap.addEventListener('mouseleave', () => {
      this.isHovered = false;
      this.targetX = 50;
      this.targetY = 50;
      this.mask.setAttribute('r', '22%');
    });

    this.wrap.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        const rect = this.svg.getBoundingClientRect();
        const touch = e.touches[0];
        const x = ((touch.clientX - rect.left) / rect.width) * 100;
        const y = ((touch.clientY - rect.top) / rect.height) * 100;
        this.targetX = Math.max(0, Math.min(100, x));
        this.targetY = Math.max(0, Math.min(100, y));
      }
    }, { passive: true });
  }

  initObserver() {
    if (!this.animatedStroke) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animatedStroke.classList.add('is-drawn');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      observer.observe(this.wrap);
    } else {
      this.animatedStroke.classList.add('is-drawn');
    }
  }

  startLoop() {
    const loop = () => {
      const factor = 0.16;
      const dx = this.targetX - this.currentX;
      const dy = this.targetY - this.currentY;

      if (Math.abs(dx) > 0.02 || Math.abs(dy) > 0.02) {
        this.currentX += dx * factor;
        this.currentY += dy * factor;
        this.mask.setAttribute('cx', `${this.currentX.toFixed(2)}%`);
        this.mask.setAttribute('cy', `${this.currentY.toFixed(2)}%`);
      }

      this.rafId = requestAnimationFrame(loop);
    };

    loop();
  }
}

