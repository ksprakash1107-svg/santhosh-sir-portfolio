/**
 * Neon Polyglot Falling Letters Cursor
 * Santhosh S. — Multilingual Educator Portfolio
 * 
 * Features:
 * 1. Minimalist Neon Cursor: A luminous starlight pearl (emerald & champagne gold neon aura)
 *    paired with a fluid spring-lerped trailing reticle ring.
 * 2. 5-Language Falling Letters Trail: As the cursor moves across the screen, characters from
 *    the 5 living languages (Tamil, English, Malayalam, German, Japanese) gently spawn along
 *    the movement path and drift downward with subtle gravity, graceful sway, and soft neon glow.
 * 3. Portfolio Palette Harmony: Deep forest emerald (#52C79A), antique champagne gold (#B7955B),
 *    warm ivory (#F4F0E8), and amber starlight (#E8C170).
 * 4. Responsive & Accessible: Completely disabled on mobile / touch / coarse pointer devices.
 * 5. High Performance: Zero-allocation loop when idle, requestAnimationFrame batching,
 *    DPR-capped canvas, GPU transform3d.
 */

const LANGUAGE_ALPHABETS = [
  {
    name: 'Tamil',
    letters: ['த', 'மி', 'ழ்', 'அ', 'ன்', 'வ', 'சொ', 'ல்', 'க', 'ள'],
    color: '#B7955B',           // Antique Champagne Gold
    glow: 'rgba(183, 149, 91, 0.85)'
  },
  {
    name: 'English',
    letters: ['E', 'N', 'G', 'L', 'I', 'S', 'H', 'A', 'R', 'T'],
    color: '#F4F0E8',           // Warm Starlight Ivory
    glow: 'rgba(244, 240, 232, 0.8)'
  },
  {
    name: 'Malayalam',
    letters: ['മ', 'ല', 'യാ', 'ള', 'ം', 'വാ', 'ക്ക്', 'ധ', 'ര'],
    color: '#D8CBB8',           // Dravidian Sandstone
    glow: 'rgba(216, 203, 184, 0.8)'
  },
  {
    name: 'German',
    letters: ['D', 'E', 'U', 'T', 'S', 'C', 'H', 'W', 'O', 'R'],
    color: '#52C79A',           // Starlight Neon Emerald
    glow: 'rgba(82, 199, 154, 0.9)'
  },
  {
    name: 'Japanese',
    letters: ['日', '本', '語', '言', '葉', '文', '和', '道'],
    color: '#E8C170',           // Amber Gold Neon
    glow: 'rgba(232, 193, 112, 0.9)'
  }
];

export class PolyglotCursor {
  constructor() {
    // Graceful bailout on mobile / touch or coarse pointers
    if (window.matchMedia('(hover: none) or (pointer: coarse)').matches) return;

    this.mouse = { x: -200, y: -200, lastX: -200, lastY: -200 };
    this.ring = { x: -200, y: -200 };
    this.accumulatedDist = 0;
    this.langCycleIndex = 0;

    this.isHovering = false;
    this.isClicking = false;
    this.isVisible = false;

    this.particles = [];
    this.maxParticles = 75;

    this.initDOM();
    this.initCanvas();
    this.bindEvents();
    this.startRenderLoop();
  }

  initDOM() {
    // 1. Fullscreen Trail Canvas
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'neon-cursor-canvas';
    this.canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    // 2. Central High-Precision Neon Dot
    this.dotEl = document.createElement('div');
    this.dotEl.className = 'neon-cursor-dot';
    this.dotEl.setAttribute('aria-hidden', 'true');
    document.body.appendChild(this.dotEl);

    // 3. Fluid Outer Lerped Neon Ring
    this.ringEl = document.createElement('div');
    this.ringEl.className = 'neon-cursor-ring';
    this.ringEl.setAttribute('aria-hidden', 'true');
    document.body.appendChild(this.ringEl);
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
        this.dotEl.classList.add('is-visible');
        this.ringEl.classList.add('is-visible');
      }

      this.mouse.lastX = this.mouse.x;
      this.mouse.lastY = this.mouse.y;
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;

      if (this.mouse.lastX === -200) {
        this.ring.x = this.mouse.x;
        this.ring.y = this.mouse.y;
        return;
      }

      const dx = this.mouse.x - this.mouse.lastX;
      const dy = this.mouse.y - this.mouse.lastY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      this.accumulatedDist += dist;

      // Spawn a falling 5-language letter every 14px of movement
      if (this.accumulatedDist >= 14) {
        const steps = Math.min(Math.floor(this.accumulatedDist / 14), 4);
        for (let i = 0; i < steps; i++) {
          const t = (i + 1) / steps;
          const spawnX = this.mouse.lastX + dx * t;
          const spawnY = this.mouse.lastY + dy * t;
          this.spawnFallingLetter(spawnX, spawnY);
        }
        this.accumulatedDist = 0;
      }
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      this.isVisible = false;
      this.dotEl.classList.remove('is-visible');
      this.ringEl.classList.remove('is-visible');
    });

    document.addEventListener('mouseenter', () => {
      this.isVisible = true;
      this.dotEl.classList.add('is-visible');
      this.ringEl.classList.add('is-visible');
    });

    window.addEventListener('mousedown', (e) => {
      this.isClicking = true;
      this.ringEl.classList.add('is-clicking');

      // Click burst: cascade letters from all 5 languages
      LANGUAGE_ALPHABETS.forEach((lang, idx) => {
        const angle = (idx / LANGUAGE_ALPHABETS.length) * Math.PI * 2;
        const letter = lang.letters[Math.floor(Math.random() * lang.letters.length)];
        this.particles.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * (1.2 + Math.random() * 1.5),
          vy: Math.sin(angle) * (1.2 + Math.random() * 1.5) + 0.5,
          gravity: 0.04,
          swaySpeed: 0.04,
          swayAmount: 0.8,
          swayPhase: Math.random() * Math.PI * 2,
          rotation: (Math.random() - 0.5) * 0.3,
          rotSpeed: (Math.random() - 0.5) * 0.02,
          size: 14 + Math.random() * 4,
          alpha: 1,
          decay: 0.014 + Math.random() * 0.008,
          letter: letter,
          color: lang.color,
          glow: lang.glow
        });
      });
    });

    window.addEventListener('mouseup', () => {
      this.isClicking = false;
      this.ringEl.classList.remove('is-clicking');
    });

    // Detect clickable/interactive hover targets
    const hoverables = 'a, button, [role="button"], input, select, textarea, .language-card, .pillar-card, .institution-card, .timeline-step, .discipline-card, #sphere, .btn-luxury, .magnetic-btn';

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverables)) {
        this.isHovering = true;
        this.ringEl.classList.add('is-hovering');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverables)) {
        this.isHovering = false;
        this.ringEl.classList.remove('is-hovering');
      }
    });
  }

  setActiveLanguage(langId) {
    const idx = LANGUAGE_ALPHABETS.findIndex(l => l.name.toLowerCase() === langId.toLowerCase());
    if (idx !== -1) {
      this.langCycleIndex = idx;
    }
  }

  /**
   * Spawns a single falling letter from one of the 5 languages
   */
  spawnFallingLetter(x, y) {
    if (this.particles.length >= this.maxParticles) {
      this.particles.shift();
    }

    // Cycle through the 5 languages sequentially so all 5 are gracefully represented
    const lang = LANGUAGE_ALPHABETS[this.langCycleIndex];
    this.langCycleIndex = (this.langCycleIndex + 1) % LANGUAGE_ALPHABETS.length;

    const letter = lang.letters[Math.floor(Math.random() * lang.letters.length)];

    // Slight lateral jitter for organic drift
    const jitterX = (Math.random() - 0.5) * 8;
    const jitterY = (Math.random() - 0.5) * 8;

    this.particles.push({
      x: x + jitterX,
      y: y + jitterY,
      vx: (Math.random() - 0.5) * 0.8,
      vy: 0.6 + Math.random() * 0.8,         // Initial downward velocity
      gravity: 0.038,                        // Gentle downward acceleration
      swaySpeed: 0.035 + Math.random() * 0.02,
      swayAmount: 0.6 + Math.random() * 0.8,
      swayPhase: Math.random() * Math.PI * 2,
      rotation: (Math.random() - 0.5) * 0.25,
      rotSpeed: (Math.random() - 0.5) * 0.015,
      size: 12 + Math.random() * 4,
      alpha: 0.95,
      decay: 0.015 + Math.random() * 0.008,  // ~1.2s to 1.8s lifespan
      letter: letter,
      color: lang.color,
      glow: lang.glow
    });
  }

  updateParticles() {
    if (!this.ctx) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    if (this.particles.length === 0) return;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Physical motion: gravity pulling down + gentle side-to-side sway
      p.vy += p.gravity;
      p.swayPhase += p.swaySpeed;
      const sway = Math.sin(p.swayPhase) * p.swayAmount;

      p.x += p.vx + sway;
      p.y += p.vy;
      p.rotation += p.rotSpeed;
      p.alpha -= p.decay;

      if (p.alpha <= 0.02) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);

      // Typography covering all 5 scripts
      this.ctx.font = `600 ${p.size}px "Playfair Display", "Noto Sans Tamil", "Noto Sans Malayalam", "Noto Sans JP", "DM Sans", sans-serif`;

      // Dual-layer neon glow effect
      this.ctx.shadowColor = p.glow;
      this.ctx.shadowBlur = 10;
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';

      this.ctx.fillText(p.letter, 0, 0);

      this.ctx.restore();
    }
  }

  startRenderLoop() {
    const render = () => {
      if (this.isVisible) {
        // Immediate dot tracking
        this.dotEl.style.transform = `translate3d(${this.mouse.x}px, ${this.mouse.y}px, 0) translate(-50%, -50%)`;

        // Smooth spring lerp for outer neon ring
        const lerpFactor = 0.2;
        this.ring.x += (this.mouse.x - this.ring.x) * lerpFactor;
        this.ring.y += (this.mouse.y - this.ring.y) * lerpFactor;
        this.ringEl.style.transform = `translate3d(${this.ring.x}px, ${this.ring.y}px, 0) translate(-50%, -50%)`;
      }

      // Update falling 5-language letter particles
      this.updateParticles();

      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  }
}
