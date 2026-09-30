/**
 * Interactive 3D Works Wheel
 * Santhosh S. — Multilingual Educator Portfolio
 * 
 * 3D cylindrical drum & ring portfolio index:
 * - At rest: pieces sit in an armillary circle around "Works '26".
 * - On turn/scroll/drag: ring blows open into a vertical 3D perspective drum.
 * - Single rAF loop writing hardware-accelerated transforms directly to the DOM.
 */

export const WORKS_WHEEL_ITEMS = [
  {
    title: "Madras Engineering College",
    category: "Higher Education Faculty",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=900&auto=format&fit=crop&q=80",
    href: "https://www.madrascollege.ac.in/",
    action: "Visit Institution"
  },
  {
    title: "GoStudy Global Ecosystem",
    category: "Global Student Mobility",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80",
    href: "https://www.go.study",
    action: "Explore Ecosystem"
  },
  {
    title: "Indo-Australian Nexus",
    category: "Transcontinental Bridge",
    image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=900&auto=format&fit=crop&q=80",
    href: "#journey",
    action: "View Trajectory"
  },
  {
    title: "IELTS & Test Prep Mastery",
    category: "High-Stakes Examination",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=900&auto=format&fit=crop&q=80",
    href: "#training",
    action: "View Disciplines"
  },
  {
    title: "Executive Business German",
    category: "CEFR Corporate Fluency",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=900&auto=format&fit=crop&q=80",
    href: "#languages",
    action: "Language Matrix"
  },
  {
    title: "Japanese Language & JLPT",
    category: "Asian Linguistics Horizon",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=900&auto=format&fit=crop&q=80",
    href: "#languages",
    action: "Kanji Dynamics"
  },
  {
    title: "Articulatory Phonetics",
    category: "Pedagogical Scaffolding",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&auto=format&fit=crop&q=80",
    href: "#about",
    action: "Read Philosophy"
  }
];

const CARD_H = 0.40;
const CARD_MAX_W = 0.35;
const CARD_RATIO = 1.45;
const STEP = 42;
const DRUM = 2.22;
const LENS = 2.7;
const RING_R = 1.14;
const BOW = 1.82;
const CULL = 1.6;

const WHEEL_UNITS = 850;
const DRAG_UNITS = 380;
const SETTLE = 150;
const EASE = 0.12;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rad = (deg) => (deg * Math.PI) / 180;
const bowAt = (drumDeg, bow) => -bow * (1 - Math.cos(rad(drumDeg)));

function place(ringDeg, drumDeg, ringR, drumR, bow, m) {
  return (
    `translateX(${m * bowAt(drumDeg, bow)}px)` +
    ` rotateZ(${(1 - m) * ringDeg}deg) translateY(${-(1 - m) * ringR}px)` +
    ` rotateX(${m * drumDeg}deg) translateZ(${m * drumR}px)`
  );
}

export class InteractiveWorksWheel {
  constructor(containerId = 'works-wheel-container', items = WORKS_WHEEL_ITEMS, label = "Works '26") {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.items = items;
    this.count = items.length;
    this.last = Math.max(this.count - 1, 0);
    this.label = label;

    this.turn = 0;
    this.target = 0;
    this.active = 0;
    this.stage = { w: 0, h: 0 };
    this.dragStart = null;
    this.settleTimeout = null;

    this.cardEls = [];
    this.indexBtnEls = [];

    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.initDOM();
    this.initEvents();
    this.startLoop();
  }

  initDOM() {
    this.container.innerHTML = `
      <section class="works-wheel-stage-wrap" aria-label="${this.label}">
        <div class="works-wheel-stage" role="listbox" aria-label="${this.label}" tabindex="0">
          <div class="works-wheel-inner"></div>
        </div>

        <!-- Center Ring Label -->
        <div class="works-wheel-ring-label" aria-hidden="true">${this.label}</div>

        <!-- Front Item Active Title (Left) -->
        <div class="works-wheel-front-title" aria-live="polite">
          <span class="works-wheel-category">01 — HIGHER EDUCATION</span>
          <h4 class="works-wheel-name">${this.items[0]?.title}</h4>
        </div>

        <!-- Index List (Right) -->
        <ol class="works-wheel-index" aria-label="Works index">
          ${this.items.map((item, idx) => `
            <li>
              <button type="button" class="works-wheel-index-btn ${idx === 0 ? 'active' : ''}" data-index="${idx}">
                <span class="wheel-num">0${idx + 1}</span>
                <span class="wheel-title">${item.title}</span>
              </button>
            </li>
          `).join('')}
        </ol>

        <!-- Subtle Controls Hint -->
        <div class="works-wheel-controls-hint">
          <span class="hint-dot"></span> Drag or scroll to turn cylinder
        </div>
      </section>
    `;

    this.stageWrap = this.container.querySelector('.works-wheel-stage-wrap');
    this.stageEl = this.container.querySelector('.works-wheel-stage');
    this.wheelInner = this.container.querySelector('.works-wheel-inner');
    this.ringLabelEl = this.container.querySelector('.works-wheel-ring-label');
    this.frontTitleEl = this.container.querySelector('.works-wheel-front-title');
    this.frontCatEl = this.container.querySelector('.works-wheel-category');
    this.frontNameEl = this.container.querySelector('.works-wheel-name');
    this.indexBtnEls = Array.from(this.container.querySelectorAll('.works-wheel-index-btn'));

    // Render cards
    this.items.forEach((item, idx) => {
      const card = document.createElement(item.href ? 'a' : 'div');
      card.className = 'works-wheel-card';
      card.id = `works-card-${idx}`;
      card.setAttribute('role', 'option');
      card.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
      if (item.href) {
        card.href = item.href;
        if (item.href.startsWith('http')) {
          card.target = '_blank';
          card.rel = 'noopener noreferrer';
        }
      }

      card.innerHTML = `
        <div class="works-wheel-card-face">
          <img src="${item.image}" alt="${item.title}" draggable="false" loading="lazy" />
          ${item.action && item.href ? `
            <span class="works-wheel-card-action-pill">
              <span>${item.action}</span>
              <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
                <path d="M3 9 9 3M4 3h5v5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          ` : ''}
        </div>
      `;

      this.wheelInner.appendChild(card);
      this.cardEls.push(card);
    });

    this.updateMetrics();
  }

  updateMetrics() {
    if (!this.stageEl) return;
    const w = this.stageEl.clientWidth || 900;
    const h = this.stageEl.clientHeight || 520;
    this.stage = { w, h };

    const isMobile = w < 768;
    const maxW = isMobile ? 0.62 : CARD_MAX_W;
    const cardW = Math.min(h * CARD_H * CARD_RATIO, w * maxW);
    const cardH = cardW / CARD_RATIO;
    const drumR = cardH * DRUM;
    const ringR = cardH * RING_R;
    const ringScale = this.count
      ? clamp((((2 * Math.PI * ringR) / this.count) * 0.82) / (cardW || 1), 0.18, 1)
      : 1;

    this.metrics = {
      cardW,
      cardH,
      ringR,
      ringScale,
      drumR,
      bow: cardH * BOW,
      depth: cardH * LENS
    };

    this.stageEl.style.perspective = `${this.metrics.depth}px`;

    // Apply dimensions to cards
    this.cardEls.forEach(card => {
      card.style.width = `${cardW}px`;
      card.style.height = `${cardH}px`;
      card.style.marginLeft = `${-cardW / 2}px`;
      card.style.marginTop = `${-cardH / 2}px`;
    });
  }

  initEvents() {
    // 1. ResizeObserver
    const ro = new ResizeObserver(() => {
      this.updateMetrics();
    });
    ro.observe(this.stageEl);

    // 2. Wheel event on stage (cancellable when within bounds)
    this.stageEl.addEventListener('wheel', (e) => {
      const next = this.target + e.deltaY / WHEEL_UNITS;
      if (next > 0 && next < this.last + 1) {
        e.preventDefault();
      }
      this.to(next);

      clearTimeout(this.settleTimeout);
      this.settleTimeout = setTimeout(() => {
        this.to(Math.round(this.target));
      }, SETTLE);
    }, { passive: false });

    // 3. Pointer drag
    this.stageEl.addEventListener('pointerdown', (e) => {
      this.dragStart = e.clientY;
      this.stageEl.setPointerCapture(e.pointerId);
    });

    this.stageEl.addEventListener('pointermove', (e) => {
      if (this.dragStart === null) return;
      const dy = this.dragStart - e.clientY;
      this.to(this.target + dy / DRAG_UNITS);
      this.dragStart = e.clientY;
    });

    const onPointerUp = () => {
      if (this.dragStart === null) return;
      this.dragStart = null;
      if (this.target > 1) {
        this.to(Math.round(this.target));
      }
    };

    this.stageEl.addEventListener('pointerup', onPointerUp);
    this.stageEl.addEventListener('pointercancel', onPointerUp);

    // 4. Keyboard arrow navigation
    this.stageEl.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.to(Math.round(this.target) + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.to(Math.round(this.target) - 1);
      }
    });

    // 5. Index button clicks
    this.indexBtnEls.forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index') || '0', 10);
        this.to(idx + 1);
      });
    });
  }

  to(next) {
    this.target = clamp(next, 0, this.last + 1);
  }

  startLoop() {
    const draw = () => {
      this.rafId = requestAnimationFrame(draw);

      if (!this.metrics) return;
      const { ringR, ringScale, drumR, bow } = this.metrics;

      const gap = this.target - this.turn;
      if (Math.abs(gap) < 0.0005) {
        this.turn = this.target;
      } else {
        this.turn += gap * (this.reducedMotion ? 1 : EASE);
      }

      const t = this.turn;
      const m = clamp(t, 0, 1);
      const pos = Math.max(0, t - 1);

      if (this.wheelInner) {
        this.wheelInner.style.transform = `translateZ(${-m * drumR}px)`;
      }

      for (let i = 0; i < this.count; i++) {
        const d = i - pos;
        const drumDeg = d * STEP;
        const card = this.cardEls[i];
        if (card) {
          card.style.transform = place(
            d * (360 / this.count),
            drumDeg,
            ringR,
            drumR,
            bow,
            m
          );

          card.style.opacity = m > 0.5 && Math.abs(d) > CULL ? '0' : '1';
          card.style.zIndex = String(Math.round(100 - Math.abs(d) * 2));

          const face = card.querySelector('.works-wheel-card-face');
          if (face) {
            face.style.transform = `scale(${lerp(ringScale, 1, m)})`;
          }
        }
      }

      // Transition center ring label vs front title
      if (this.ringLabelEl) {
        this.ringLabelEl.style.opacity = String(1 - m);
      }

      if (this.frontTitleEl) {
        this.frontTitleEl.style.opacity = String(m);
      }

      const near = clamp(Math.round(pos), 0, this.last);
      if (this.active !== near) {
        this.active = near;
        this.updateActiveItem(near);
      }
    };

    this.rafId = requestAnimationFrame(draw);
  }

  updateActiveItem(idx) {
    const item = this.items[idx];
    if (!item) return;

    if (this.frontCatEl) {
      this.frontCatEl.textContent = `0${idx + 1} — ${item.category.toUpperCase()}`;
    }
    if (this.frontNameEl) {
      this.frontNameEl.textContent = item.title;
    }

    this.indexBtnEls.forEach((btn, i) => {
      const isMatch = i === idx;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });

    this.cardEls.forEach((card, i) => {
      card.setAttribute('aria-selected', i === idx ? 'true' : 'false');
    });
  }
}
