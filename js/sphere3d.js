/**
 * Global Language Sphere — Interactive 3D Canvas Engine
 * Renders a bespoke 3D linguistic celestial sphere orbiting the 5 languages:
 * தமிழ், English, മലയാളം, Deutsch, 日本語.
 * Features:
 * - 3D Perspective Projection with depth sorting & alpha fading
 * - Inertial trackball mouse & touch drag
 * - Subtle auto-rotation & scroll reactivity
 * - High-DPI Retina scaling
 * - IntersectionObserver lifecycle management for zero idle CPU usage
 * - Reduced-motion graceful handling
 */

export class GlobalLanguageSphere {
  constructor(canvasId, fallbackId) {
    this.canvas = document.getElementById(canvasId);
    this.fallback = document.getElementById(fallbackId);

    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) {
      this.showFallback();
      return;
    }

    // Check for reduced motion
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (this.reducedMotion) {
      this.showFallback();
      return;
    }

    // 3D Sphere Parameters
    this.radius = 165;
    this.perspective = 520;
    this.rotX = 0.25;
    this.rotY = 0.4;
    this.targetRotX = 0.25;
    this.targetRotY = 0.4;
    this.velX = 0;
    this.velY = 0;
    this.isDragging = false;
    this.lastPointerX = 0;
    this.lastPointerY = 0;
    this.autoRotateSpeed = 0.0035;

    // Multilingual Orbiting Nodes
    this.languageNodes = [
      { text: "தமிழ்", sub: "Tamil", ipa: "/t̪ɐmɨɻ/", phi: 0, theta: 0, color: "#B7955B", id: "tamil" },
      { text: "English", sub: "English", ipa: "/ˈɪŋɡlɪʃ/", phi: Math.PI * 0.4, theta: 0.35, color: "#F4F0E8", id: "english" },
      { text: "മലയാളം", sub: "Malayalam", ipa: "/mɐlɐjaːɭɐm/", phi: Math.PI * 0.8, theta: -0.4, color: "#D8CBB8", id: "malayalam" },
      { text: "Deutsch", sub: "German", ipa: "/dɔʏtʃ/", phi: Math.PI * 1.2, theta: 0.5, color: "#E0D7C6", id: "german" },
      { text: "日本語", sub: "Japanese", ipa: "/nihonɡo/", phi: Math.PI * 1.6, theta: -0.25, color: "#C8A97E", id: "japanese" }
    ];

    // Constellation Points on the sphere surface
    this.surfacePoints = [];
    this.initSurfacePoints(75);

    // Coordinate rings
    this.rings = [
      { radius: this.radius, tilt: 0, pitch: 0 },
      { radius: this.radius, tilt: Math.PI / 4, pitch: Math.PI / 6 },
      { radius: this.radius, tilt: -Math.PI / 4, pitch: -Math.PI / 6 },
      { radius: this.radius * 1.18, tilt: 0.3, pitch: 0.2 } // Celestial equator
    ];

    this.isRunning = false;
    this.rafId = null;

    this.initDpi();
    this.bindEvents();
    this.initObserver();
  }

  showFallback() {
    if (this.canvas) this.canvas.style.display = 'none';
    if (this.fallback) this.fallback.classList.add('active');
  }

  initDpi() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width || 480;
    this.height = rect.height || 480;

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);

    this.cx = this.width / 2;
    this.cy = this.height / 2;
    this.radius = Math.min(this.width, this.height) * 0.34;
  }

  initSurfacePoints(count) {
    // Generate evenly spaced points on sphere using Fibonacci spiral
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden ratio angle
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      this.surfacePoints.push({
        x: x * this.radius,
        y: y * this.radius,
        z: z * this.radius,
        size: (i % 5 === 0) ? 2.5 : 1.5,
        alpha: 0.4 + (i % 3) * 0.2
      });
    }
  }

  bindEvents() {
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.initDpi();
        if (!this.isRunning) this.render();
      }, 120);
    }, { passive: true });

    // Pointer Drag Interactions
    const onPointerDown = (e) => {
      this.isDragging = true;
      this.lastPointerX = e.clientX || (e.touches && e.touches[0].clientX);
      this.lastPointerY = e.clientY || (e.touches && e.touches[0].clientY);
    };

    const onPointerMove = (e) => {
      if (!this.isDragging) {
        // Subtle tilt when hovering
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        if (clientX && clientY) {
          const rect = this.canvas.getBoundingClientRect();
          const normX = (clientX - rect.left) / rect.width - 0.5;
          const normY = (clientY - rect.top) / rect.height - 0.5;
          this.targetRotY += normX * 0.001;
          this.targetRotX -= normY * 0.001;
        }
        return;
      }

      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);

      const dx = clientX - this.lastPointerX;
      const dy = clientY - this.lastPointerY;

      this.velY = dx * 0.004;
      this.velX = -dy * 0.004;

      this.rotY += this.velY;
      this.rotX += this.velX;

      this.lastPointerX = clientX;
      this.lastPointerY = clientY;
    };

    const onPointerUp = () => {
      this.isDragging = false;
    };

    this.canvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('mouseup', onPointerUp);

    this.canvas.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);
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
    }, { threshold: 0.1 });

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

  // Programmatically highlight and pivot toward a language
  focusLanguage(languageId) {
    const target = this.languageNodes.find(n => n.id === languageId);
    if (!target) return;
    this.targetRotY = -target.phi + Math.PI / 2;
    this.targetRotX = 0.2;
  }

  project(x, y, z) {
    // 3D rotation along X and Y axes
    // Rotate Y
    const cosY = Math.cos(this.rotY);
    const sinY = Math.sin(this.rotY);
    const x1 = x * cosY - z * sinY;
    const z1 = z * cosY + x * sinY;

    // Rotate X
    const cosX = Math.cos(this.rotX);
    const sinX = Math.sin(this.rotX);
    const y2 = y * cosX - z1 * sinX;
    const z2 = z1 * cosX + y * sinX;

    // Perspective factor
    const scale = this.perspective / (this.perspective + z2);
    const px = this.cx + x1 * scale;
    const py = this.cy + y2 * scale;

    return { px, py, scale, z: z2 };
  }

  tick() {
    if (!this.isRunning) return;

    // Physics & inertia
    if (!this.isDragging) {
      this.rotY += this.autoRotateSpeed + this.velY;
      this.rotX += this.velX;

      this.velY *= 0.94;
      this.velX *= 0.94;
    }

    // Clamp vertical tilt to avoid flip
    this.rotX = Math.max(-Math.PI * 0.42, Math.min(Math.PI * 0.42, this.rotX));

    this.render();
    this.rafId = requestAnimationFrame(() => this.tick());
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw Subtle Atmospheric Glow
    const glowGrad = this.ctx.createRadialGradient(
      this.cx, this.cy, this.radius * 0.2,
      this.cx, this.cy, this.radius * 1.35
    );
    glowGrad.addColorStop(0, 'rgba(23, 53, 47, 0.45)');
    glowGrad.addColorStop(0.7, 'rgba(183, 149, 91, 0.04)');
    glowGrad.addColorStop(1, 'rgba(17, 19, 19, 0)');

    this.ctx.fillStyle = glowGrad;
    this.ctx.beginPath();
    this.ctx.arc(this.cx, this.cy, this.radius * 1.35, 0, Math.PI * 2);
    this.ctx.fill();

    // Render Orbit Rings
    this.renderRings();

    // Collect all 3D drawable elements for depth sorting
    const renderQueue = [];

    // 1. Surface Points
    this.surfacePoints.forEach(pt => {
      const proj = this.project(pt.x, pt.y, pt.z);
      renderQueue.push({
        type: 'point',
        z: proj.z,
        px: proj.px,
        py: proj.py,
        scale: proj.scale,
        size: pt.size,
        alpha: pt.alpha
      });
    });

    // 2. Language Nodes
    const rOrbit = this.radius * 1.08;
    this.languageNodes.forEach(node => {
      const x = rOrbit * Math.cos(node.phi) * Math.cos(node.theta);
      const y = rOrbit * Math.sin(node.theta);
      const z = rOrbit * Math.sin(node.phi) * Math.cos(node.theta);

      const proj = this.project(x, y, z);
      renderQueue.push({
        type: 'label',
        z: proj.z,
        px: proj.px,
        py: proj.py,
        scale: proj.scale,
        node: node
      });
    });

    // Depth Sorting: back to front (largest z first)
    renderQueue.sort((a, b) => b.z - a.z);

    // Draw elements
    renderQueue.forEach(item => {
      if (item.type === 'point') {
        const isFront = item.z < 0;
        const alpha = isFront ? Math.min(0.85, item.alpha * item.scale) : Math.max(0.08, item.alpha * 0.25 * item.scale);
        this.ctx.fillStyle = isFront ? `rgba(216, 203, 184, ${alpha})` : `rgba(23, 53, 47, ${alpha})`;
        this.ctx.beginPath();
        this.ctx.arc(item.px, item.py, item.size * item.scale, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (item.type === 'label') {
        this.drawLanguageNode(item);
      }
    });
  }

  renderRings() {
    this.rings.forEach((ring, idx) => {
      const points = [];
      const segments = 48;
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        let x = ring.radius * Math.cos(angle);
        let y = ring.radius * Math.sin(angle) * Math.sin(ring.tilt);
        let z = ring.radius * Math.sin(angle) * Math.cos(ring.tilt);

        if (ring.pitch !== 0) {
          const cosP = Math.cos(ring.pitch);
          const sinP = Math.sin(ring.pitch);
          const x2 = x * cosP + y * sinP;
          const y2 = -x * sinP + y * cosP;
          x = x2;
          y = y2;
        }

        points.push(this.project(x, y, z));
      }

      this.ctx.beginPath();
      points.forEach((pt, i) => {
        if (i === 0) this.ctx.moveTo(pt.px, pt.py);
        else this.ctx.lineTo(pt.px, pt.py);
      });

      this.ctx.strokeStyle = idx === 3 ? 'rgba(183, 149, 91, 0.35)' : 'rgba(216, 203, 184, 0.12)';
      this.ctx.lineWidth = idx === 3 ? 1.5 : 1;
      this.ctx.stroke();
    });
  }

  drawLanguageNode(item) {
    const isFront = item.z < 0;
    const alpha = isFront ? Math.min(1, 0.4 + (1 - (item.z / -this.radius)) * 0.6) : Math.max(0.2, 0.4 - (item.z / this.radius) * 0.3);
    const node = item.node;

    this.ctx.save();
    this.ctx.translate(item.px, item.py);
    this.ctx.scale(item.scale, item.scale);

    // Anchor Node Core
    this.ctx.beginPath();
    this.ctx.arc(0, 0, isFront ? 4.5 : 2.5, 0, Math.PI * 2);
    this.ctx.fillStyle = isFront ? node.color : 'rgba(216, 203, 184, 0.3)';
    this.ctx.shadowColor = isFront ? 'rgba(183, 149, 91, 0.5)' : 'transparent';
    this.ctx.shadowBlur = isFront ? 10 : 0;
    this.ctx.fill();

    // Node Callout Card Background (when facing front)
    if (isFront) {
      const boxH = 38;
      const scriptFont = '600 13px "Playfair Display", "Noto Sans Tamil", "Noto Sans Malayalam", "Noto Sans JP", sans-serif';
      const subFont = '500 8.5px "DM Mono", monospace';

      this.ctx.font = scriptFont;
      const wScript = this.ctx.measureText(node.text).width;

      this.ctx.font = subFont;
      const subText = `${node.sub.toUpperCase()} ${node.ipa || ''}`;
      const wSub = this.ctx.measureText(subText).width;

      const boxW = Math.max(104, Math.ceil(Math.max(wScript, wSub) + 24));

      this.ctx.fillStyle = `rgba(17, 19, 19, ${0.92 * alpha})`;
      this.ctx.strokeStyle = `rgba(183, 149, 91, ${0.55 * alpha})`;
      this.ctx.lineWidth = 1;

      this.ctx.beginPath();
      if (typeof this.ctx.roundRect === 'function') {
        this.ctx.roundRect(8, -boxH / 2, boxW, boxH, 4);
      } else {
        this.ctx.rect(8, -boxH / 2, boxW, boxH);
      }
      this.ctx.fill();
      this.ctx.stroke();

      // Script Text
      this.ctx.fillStyle = `rgba(244, 240, 232, ${alpha})`;
      this.ctx.font = scriptFont;
      this.ctx.textAlign = 'left';
      this.ctx.fillText(node.text, 16, -3);

      // Subtitle & IPA
      this.ctx.fillStyle = `rgba(183, 149, 91, ${alpha * 0.95})`;
      this.ctx.font = subFont;
      this.ctx.fillText(subText, 16, 11);
    } else {
      // Subtle faded back text
      this.ctx.fillStyle = `rgba(216, 203, 184, ${alpha * 0.6})`;
      this.ctx.font = '400 11px "Playfair Display", sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(node.text, 0, -8);
    }

    this.ctx.restore();
  }
}
