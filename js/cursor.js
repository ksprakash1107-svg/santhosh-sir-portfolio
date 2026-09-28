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
    glow: 'rgba(183, 149, 91, 0.85)',
    glitterColor: '#F5D77F'
  },
  {
    name: 'English',
    letters: ['E', 'N', 'G', 'L', 'I', 'S', 'H', 'A', 'R', 'T'],
    color: '#F4F0E8',           // Warm Starlight Ivory
    glow: 'rgba(244, 240, 232, 0.8)',
    glitterColor: '#FFFFFF'
  },
  {
    name: 'Malayalam',
    letters: ['മ', 'ല', 'യാ', 'ള', 'ം', 'വാ', 'ക്ക്', 'ധ', 'ര'],
    color: '#D8CBB8',           // Dravidian Sandstone
    glow: 'rgba(216, 203, 184, 0.8)',
    glitterColor: '#EDE5D8'
  },
  {
    name: 'German',
    letters: ['D', 'E', 'U', 'T', 'S', 'C', 'H', 'W', 'O', 'R'],
    color: '#52C79A',           // Starlight Neon Emerald
    glow: 'rgba(82, 199, 154, 0.9)',
    glitterColor: '#76E2B9'
  },
  {
    name: 'Japanese',
    letters: ['日', '本', '語', '言', '葉', '文', '和', '道'],
    color: '#E8C170',           // Amber Gold Neon
    glow: 'rgba(232, 193, 112, 0.9)',
    glitterColor: '#FFDF88'
  }
];

export class PolyglotCursor {
  constructor() {
    // Graceful bailout on mobile / touch or coarse pointers
    if (window.matchMedia('(hover: none) or (pointer: coarse)').matches) return;

    this.mouse = { x: -200, y: -200, lastX: -200, lastY: -200 };
    this.ring = { x: -200, y: -200 };
    this.accumulatedDistLetter = 0;
    this.accumulatedDistGlitter = 0;
    this.langCycleIndex = 0;

    this.isHovering = false;
    this.isClicking = false;
    this.isVisible = false;

    // Separate pools: sparse letters + delicate starlight glitter sparkles
    this.letters = [];
    this.sparkles = [];
    this.maxLetters = 20;     // Sparsely distributed, elegant and legible
    this.maxSparkles = 32;    // Delicate starlight glitter specks

    this.letterSpawnDist = 48; // Spaced out: spawns ~1 letter every 48px
    this.glitterSpawnDist = 22; // Delicate glitter specks every 22px

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

      this.accumulatedDistLetter += dist;
      this.accumulatedDistGlitter += dist;

      // 1. Sparse Letter Spawning: exactly ONE letter every ~48px of movement
      if (this.accumulatedDistLetter >= this.letterSpawnDist) {
        const spawnX = this.mouse.lastX + dx * 0.5;
        const spawnY = this.mouse.lastY + dy * 0.5;
        this.spawnFallingLetter(spawnX, spawnY);
        this.accumulatedDistLetter = 0;
      }

      // 2. Subtle Glitter Sparkle Spawning: tiny micro-spark every ~22px
      if (this.accumulatedDistGlitter >= this.glitterSpawnDist) {
        const spawnX = this.mouse.lastX + dx * (0.3 + Math.random() * 0.4);
        const spawnY = this.mouse.lastY + dy * (0.3 + Math.random() * 0.4);
        this.spawnGlitterSparkle(spawnX, spawnY);
        this.accumulatedDistGlitter = 0;
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

      // Click burst: 3 delicate letters + a ring of 6 sparkling glitter stars
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
        const lang = LANGUAGE_ALPHABETS[Math.floor(Math.random() * LANGUAGE_ALPHABETS.length)];
        const letter = lang.letters[Math.floor(Math.random() * lang.letters.length)];
        this.letters.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * (1.0 + Math.random() * 1.2),
          vy: Math.sin(angle) * (1.0 + Math.random() * 1.2) + 0.4,
          gravity: 0.035,
          swaySpeed: 0.04,
          swayAmount: 0.7,
          swayPhase: Math.random() * Math.PI * 2,
          rotation: (Math.random() - 0.5) * 0.3,
          rotSpeed: (Math.random() - 0.5) * 0.02,
          size: 13 + Math.random() * 3,
          alpha: 1,
          decay: 0.012 + Math.random() * 0.006,
          letter: letter,
          color: lang.color,
          glow: lang.glow,
          glitterColor: lang.glitterColor,
          glitterPhase: Math.random() * Math.PI * 2,
          glitterSpeed: 0.12 + Math.random() * 0.08,
          age: 0
        });
      }

      // Add 6 tiny glitter sparkles to the burst
      for (let j = 0; j < 6; j++) {
        const angle = (j / 6) * Math.PI * 2 + Math.random() * 0.4;
        const speed = 1.4 + Math.random() * 2.0;
        this.sparkles.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.3,
          size: 3.0 + Math.random() * 2.2,
          rotation: Math.random() * Math.PI,
          rotSpeed: (Math.random() - 0.5) * 0.15,
          alpha: 1,
          decay: 0.025 + Math.random() * 0.015,
          color: j % 2 === 0 ? '#F5D77F' : '#76E2B9',
          twinkleSpeed: 0.25,
          age: 0
        });
      }
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
    if (this.letters.length >= this.maxLetters) {
      this.letters.shift();
    }

    // Cycle through the 5 languages sequentially so all 5 are gracefully represented
    const lang = LANGUAGE_ALPHABETS[this.langCycleIndex];
    this.langCycleIndex = (this.langCycleIndex + 1) % LANGUAGE_ALPHABETS.length;

    const letter = lang.letters[Math.floor(Math.random() * lang.letters.length)];

    // Slight organic drift jitter
    const jitterX = (Math.random() - 0.5) * 10;
    const jitterY = (Math.random() - 0.5) * 6;

    this.letters.push({
      x: x + jitterX,
      y: y + jitterY,
      vx: (Math.random() - 0.5) * 0.5,
      vy: 0.5 + Math.random() * 0.6,         // Gentle downward drift
      gravity: 0.032,                       // Delicate gravity
      swaySpeed: 0.032 + Math.random() * 0.02,
      swayAmount: 0.6 + Math.random() * 0.6,
      swayPhase: Math.random() * Math.PI * 2,
      rotation: (Math.random() - 0.5) * 0.22,
      rotSpeed: (Math.random() - 0.5) * 0.012,
      size: 13 + Math.random() * 3,
      alpha: 0.95,
      decay: 0.012 + Math.random() * 0.006, // ~1.5s to 2s lifespan
      letter: letter,
      color: lang.color,
      glow: lang.glow,
      glitterColor: lang.glitterColor,
      glitterPhase: Math.random() * Math.PI * 2,
      glitterSpeed: 0.11 + Math.random() * 0.08,
      age: 0
    });
  }

  /**
   * Spawns a tiny starlight glitter sparkle
   */
  spawnGlitterSparkle(x, y) {
    if (this.sparkles.length >= this.maxSparkles) {
      this.sparkles.shift();
    }

    const colors = ['#F5D77F', '#FFFFFF', '#76E2B9', '#FFDF88'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const jitterX = (Math.random() - 0.5) * 16;
    const jitterY = (Math.random() - 0.5) * 14;

    this.sparkles.push({
      x: x + jitterX,
      y: y + jitterY,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4 + 0.15, // Slow float
      size: 2.2 + Math.random() * 2.2,        // Micro diamond star radius
      rotation: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 0.06,
      alpha: 0.9,
      decay: 0.02 + Math.random() * 0.018,    // ~0.8s life
      color: color,
      twinkleSpeed: 0.2 + Math.random() * 0.12,
      age: 0
    });
  }

  /**
   * Renders a 4-pointed diamond star sparkle
   */
  drawSparkleStar(x, y, radius, rotation, alpha, color) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;

    const rOuter = radius;
    const rInner = radius * 0.22;

    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const a1 = (i * Math.PI) / 2;
      const a2 = a1 + Math.PI / 4;
      if (i === 0) ctx.moveTo(Math.cos(a1) * rOuter, Math.sin(a1) * rOuter);
      else ctx.lineTo(Math.cos(a1) * rOuter, Math.sin(a1) * rOuter);
      ctx.lineTo(Math.cos(a2) * rInner, Math.sin(a2) * rInner);
    }
    ctx.closePath();
    ctx.fill();

    // Central bright pinpoint jewel
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.22, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  updateParticles() {
    if (!this.ctx) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    if (this.letters.length === 0 && this.sparkles.length === 0) return;

    // 1. UPDATE & RENDER FALLING LETTERS (with subtle shimmer & glitter highlights)
    for (let i = this.letters.length - 1; i >= 0; i--) {
      const p = this.letters[i];
      p.age++;

      // Kinematics: gravity + sway
      p.vy += p.gravity;
      p.swayPhase += p.swaySpeed;
      const sway = Math.sin(p.swayPhase) * p.swayAmount;

      p.x += p.vx + sway;
      p.y += p.vy;
      p.rotation += p.rotSpeed;
      p.alpha -= p.decay;

      if (p.alpha <= 0.02) {
        this.letters.splice(i, 1);
        continue;
      }

      // Glitter shimmer modulation: sinusoidal twinkle oscillation
      const shimmer = Math.sin(p.age * p.glitterSpeed + p.glitterPhase);
      const dynamicAlpha = Math.max(0, Math.min(1, p.alpha * (0.82 + 0.28 * shimmer)));
      const dynamicBlur = 7 + 6 * Math.max(0, shimmer);

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);

      // Multi-script typography
      this.ctx.font = `600 ${p.size}px "Playfair Display", "Noto Sans Tamil", "Noto Sans Malayalam", "Noto Sans JP", "DM Sans", sans-serif`;

      // Neon base glow
      this.ctx.shadowColor = p.glow;
      this.ctx.shadowBlur = dynamicBlur;
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = dynamicAlpha;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(p.letter, 0, 0);

      // Specular starlight core when shimmering at peak (glittering effect)
      if (shimmer > 0.55 && p.alpha > 0.3) {
        this.ctx.shadowBlur = 4;
        this.ctx.shadowColor = '#FFFFFF';
        this.ctx.fillStyle = p.glitterColor || '#FFFFFF';
        this.ctx.globalAlpha = p.alpha * (shimmer - 0.55) * 1.6;
        this.ctx.fillText(p.letter, 0, 0);
      }

      this.ctx.restore();

      // Delicate micro-glint star at the corner of the letter during high shimmer
      if (shimmer > 0.8 && p.alpha > 0.4 && p.age % 4 === 0) {
        const glintX = p.x + (p.size * 0.45);
        const glintY = p.y - (p.size * 0.4);
        this.drawSparkleStar(glintX, glintY, 3.2, p.age * 0.1, p.alpha * 0.9, p.glitterColor || '#F5D77F');
      }

      // Chance to shed a subtle trailing micro-sparkle as it floats
      if (Math.random() < 0.04 && this.sparkles.length < this.maxSparkles) {
        this.sparkles.push({
          x: p.x + (Math.random() - 0.5) * 8,
          y: p.y + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 0.3,
          vy: 0.1 + Math.random() * 0.3,
          size: 1.8 + Math.random() * 1.5,
          rotation: Math.random() * Math.PI,
          rotSpeed: 0.05,
          alpha: p.alpha * 0.85,
          decay: 0.025 + Math.random() * 0.02,
          color: p.glitterColor || '#F5D77F',
          twinkleSpeed: 0.22,
          age: 0
        });
      }
    }

    // 2. UPDATE & RENDER CELESTIAL GLITTER SPARKLES
    for (let j = this.sparkles.length - 1; j >= 0; j--) {
      const s = this.sparkles[j];
      s.age++;
      s.x += s.vx;
      s.y += s.vy;
      s.rotation += s.rotSpeed;
      s.alpha -= s.decay;

      if (s.alpha <= 0.02) {
        this.sparkles.splice(j, 1);
        continue;
      }

      // Rapid micro-twinkle oscillation for sparkling glint
      const twinkle = 0.7 + 0.3 * Math.sin(s.age * s.twinkleSpeed);
      const currentAlpha = Math.max(0, Math.min(1, s.alpha * twinkle));
      const currentRadius = s.size * (0.85 + 0.25 * twinkle);

      this.drawSparkleStar(s.x, s.y, currentRadius, s.rotation, currentAlpha, s.color);
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

      // Update falling 5-language letters and glittering starlight sparkles
      this.updateParticles();

      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  }
}

