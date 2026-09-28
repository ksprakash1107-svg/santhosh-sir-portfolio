/**
 * Global Language Sphere — Celestial Armillary 3D Engine
 * Santhosh S. — Personal Brand Portfolio
 * 
 * An advanced 3D interactive celestial sphere featuring:
 * 1. 3D Crystalline Core: Independent rotating faceted octahedron with pulsating diamond jewel
 * 2. Multi-Ring Armillary Grid: Geodesic parallels, meridian ellipses, and astrolabe dial
 * 3. Real-Time Energy Comets: Animated photon packets with stardust tails along orbital tracks
 * 4. Parabolic Harmonic Flight Arcs: Inter-language geodesic bridges with traveling energy sparks
 * 5. Smart Aerospace HUD Placards: Flip-adaptive glassmorphic badges with corner brackets, LED beacons, and coordinates
 * 6. Active Sonar Ping Ripples: Resonant expanding 3D perspective waves at the active node
 * 7. Interactive Canvas Hit-Testing: Click or hover directly on any 3D node to navigate languages
 * 8. High-DPI Retina scaling, smooth spring physics, and zero-idle CPU IntersectionObserver
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

    // 3D Engine Parameters
    this.radius = 160;
    this.perspective = 540;
    this.rotX = 0.22;
    this.rotY = 0.45;
    this.targetRotX = 0.22;
    this.targetRotY = 0.45;
    this.velX = 0;
    this.velY = 0;
    this.isDragging = false;
    this.dragMoved = false;
    this.lastPointerX = 0;
    this.lastPointerY = 0;
    this.autoRotateSpeed = 0.0026;
    this.isPivotingToTarget = false;

    // Time & Animation counters
    this.time = 0;
    this.coreAngleY = 0;
    this.coreAngleX = 0;

    // Active state & Hit-testing
    this.activeId = 'tamil';
    this.hoveredId = null;
    this.nodeBounds = new Map(); // id -> { minX, minY, maxX, maxY }
    this.onSelectLanguage = null;

    // Multilingual Nodes in 3D Space
    this.languageNodes = [
      {
        id: "tamil",
        text: "தமிழ்",
        sub: "TAMIL",
        ipa: "/t̪ɐmɨɻ/",
        coord: "13.08° N",
        color: "#B7955B",
        glow: "rgba(183, 149, 91, 0.95)",
        phi: 0,
        theta: 0.12
      },
      {
        id: "english",
        text: "English",
        sub: "ENGLISH",
        ipa: "/ˈɪŋɡlɪʃ/",
        coord: "GLOBAL",
        color: "#F4F0E8",
        glow: "rgba(244, 240, 232, 0.95)",
        phi: Math.PI * 0.42,
        theta: 0.45
      },
      {
        id: "malayalam",
        text: "മലയാളം",
        sub: "MALAYALAM",
        ipa: "/mɐlɐjaːɭɐm/",
        coord: "HERITAGE",
        color: "#D8CBB8",
        glow: "rgba(216, 203, 184, 0.95)",
        phi: Math.PI * 0.82,
        theta: -0.38
      },
      {
        id: "german",
        text: "Deutsch",
        sub: "GERMAN",
        ipa: "/dɔʏtʃ/",
        coord: "51.16° N",
        color: "#E0D7C6",
        glow: "rgba(224, 215, 198, 0.95)",
        phi: Math.PI * 1.24,
        theta: 0.48
      },
      {
        id: "japanese",
        text: "日本語",
        sub: "JAPANESE",
        ipa: "/nihonɡo/",
        coord: "EAST ASIA",
        color: "#C8A97E",
        glow: "rgba(200, 169, 126, 0.95)",
        phi: Math.PI * 1.66,
        theta: -0.28
      }
    ];

    // Surface Constellation Points (Fibonacci Sphere)
    this.surfacePoints = [];
    this.initSurfacePoints(92);

    // Armillary Orbital Rings
    this.rings = [
      { radius: this.radius, tilt: 0, pitch: 0, isEcliptic: false }, // Equator
      { radius: this.radius * 1.02, tilt: Math.PI / 5, pitch: Math.PI / 8, isEcliptic: true, cometId: 0 },
      { radius: this.radius * 1.02, tilt: -Math.PI / 4.5, pitch: -Math.PI / 7, isEcliptic: true, cometId: 1 },
      { radius: this.radius * 1.04, tilt: Math.PI / 2.8, pitch: Math.PI / 4, isEcliptic: true, cometId: 2 },
      { radius: this.radius * 1.24, tilt: 0.25, pitch: 0.15, isEcliptic: false, isAstrolabe: true } // Outer Dial Ring
    ];

    // Real-Time Energy Comets traversing the ecliptic rings
    this.comets = [
      { ringIdx: 1, speed: 0.016, angle: 0.5, color: '#FFFFFF', glow: '#FFE8B0', size: 3.5 },
      { ringIdx: 2, speed: -0.014, angle: 2.8, color: '#E8FFF5', glow: '#64DFB2', size: 3.0 },
      { ringIdx: 3, speed: 0.019, angle: 4.2, color: '#FFF5E0', glow: '#E8BF70', size: 3.2 }
    ];

    // Active Sonar Ripples
    this.ripples = [];
    this.lastRippleTime = 0;

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
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);

    this.cx = this.width / 2;
    this.cy = this.height / 2;
    this.radius = Math.min(this.width, this.height) * 0.325;

    // Update rings radius relative to canvas size
    if (this.rings && this.rings.length) {
      this.rings[0].radius = this.radius;
      this.rings[1].radius = this.radius * 1.02;
      this.rings[2].radius = this.radius * 1.02;
      this.rings[3].radius = this.radius * 1.04;
      this.rings[4].radius = this.radius * 1.24;
    }
  }

  initSurfacePoints(count) {
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden ratio angle
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = phi * i;
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      this.surfacePoints.push({
        x: x * this.radius,
        y: y * this.radius,
        z: z * this.radius,
        size: (i % 6 === 0) ? 2.4 : (i % 3 === 0 ? 1.8 : 1.2),
        alpha: 0.35 + (i % 4) * 0.18,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 1.5 + Math.random() * 2.5,
        isMajorStar: i % 8 === 0
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

    // Pointer Drag & Click Hit-Testing
    const getCoords = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const clientY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
        clientX,
        clientY
      };
    };

    const onPointerDown = (e) => {
      this.isDragging = true;
      this.dragMoved = false;
      this.isPivotingToTarget = false;
      const coords = getCoords(e);
      this.lastPointerX = coords.clientX;
      this.lastPointerY = coords.clientY;
      this.canvas.style.cursor = 'grabbing';
    };

    const onPointerMove = (e) => {
      const coords = getCoords(e);

      // Hit-testing when not dragging
      if (!this.isDragging) {
        let hit = null;
        for (const [id, box] of this.nodeBounds.entries()) {
          if (coords.x >= box.minX && coords.x <= box.maxX &&
              coords.y >= box.minY && coords.y <= box.maxY) {
            hit = id;
            break;
          }
        }

        if (hit !== this.hoveredId) {
          this.hoveredId = hit;
          this.canvas.style.cursor = hit ? 'pointer' : 'grab';
        }

        // Ambient hover parallax
        const normX = coords.x / this.width - 0.5;
        const normY = coords.y / this.height - 0.5;
        this.targetRotY += normX * 0.0006;
        this.targetRotX -= normY * 0.0006;
        return;
      }

      const dx = coords.clientX - this.lastPointerX;
      const dy = coords.clientY - this.lastPointerY;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        this.dragMoved = true;
      }

      this.velY = dx * 0.0038;
      this.velX = -dy * 0.0038;

      this.rotY += this.velY;
      this.rotX += this.velX;

      this.targetRotY = this.rotY;
      this.targetRotX = this.rotX;

      this.lastPointerX = coords.clientX;
      this.lastPointerY = coords.clientY;
    };

    const onPointerUp = (e) => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.canvas.style.cursor = this.hoveredId ? 'pointer' : 'grab';

      // Click detected without drag: check node selection
      if (!this.dragMoved && this.hoveredId) {
        this.setActiveLanguage(this.hoveredId);
        this.focusLanguage(this.hoveredId);
        if (typeof this.onSelectLanguage === 'function') {
          this.onSelectLanguage(this.hoveredId);
        }
      }
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

  setActiveLanguage(langId) {
    this.activeId = langId;
    this.triggerRipple(langId);
  }

  triggerRipple(langId) {
    const node = this.languageNodes.find(n => n.id === langId) || this.languageNodes[0];
    this.ripples.push({
      phi: node.phi,
      theta: node.theta,
      color: node.color,
      progress: 0,
      maxRadius: this.radius * 0.48
    });
  }

  // Smooth camera pivot toward a specific language node
  focusLanguage(languageId) {
    const target = this.languageNodes.find(n => n.id === languageId);
    if (!target) return;
    this.activeId = languageId;
    this.targetRotY = -target.phi + Math.PI / 2;
    this.targetRotX = -target.theta * 0.65;
    this.isPivotingToTarget = true;
    this.triggerRipple(languageId);
  }

  project(x, y, z) {
    // 3D rotation along Y then X
    const cosY = Math.cos(this.rotY);
    const sinY = Math.sin(this.rotY);
    const x1 = x * cosY - z * sinY;
    const z1 = z * cosY + x * sinY;

    const cosX = Math.cos(this.rotX);
    const sinX = Math.sin(this.rotX);
    const y2 = y * cosX - z1 * sinX;
    const z2 = z1 * cosX + y * sinX;

    const scale = this.perspective / (this.perspective + z2);
    const px = this.cx + x1 * scale;
    const py = this.cy + y2 * scale;

    return { px, py, scale, z: z2 };
  }

  tick() {
    if (!this.isRunning) return;

    this.time += 0.016;
    this.coreAngleY += 0.012;
    this.coreAngleX += 0.007;

    // Interpolation & Physics
    if (!this.isDragging) {
      if (this.isPivotingToTarget) {
        // Smooth spherical interpolation toward target
        this.rotY += (this.targetRotY - this.rotY) * 0.075;
        this.rotX += (this.targetRotX - this.rotX) * 0.075;

        if (Math.abs(this.targetRotY - this.rotY) < 0.002 && Math.abs(this.targetRotX - this.rotX) < 0.002) {
          this.isPivotingToTarget = false;
        }
      } else {
        // Subtle constant celestial rotation + momentum decay
        this.rotY += this.autoRotateSpeed + this.velY;
        this.rotX += this.velX;

        this.velY *= 0.94;
        this.velX *= 0.94;
      }
    }

    // Clamp vertical tilt to prevent gimbal lock
    this.rotX = Math.max(-Math.PI * 0.38, Math.min(Math.PI * 0.38, this.rotX));

    // Periodic ambient ripple for active language
    if (this.time - this.lastRippleTime > 3.2) {
      this.lastRippleTime = this.time;
      this.triggerRipple(this.activeId);
    }

    // Advance ripples
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      this.ripples[i].progress += 0.018;
      if (this.ripples[i].progress >= 1) {
        this.ripples.splice(i, 1);
      }
    }

    // Advance comets along their rings
    this.comets.forEach(comet => {
      comet.angle += comet.speed;
      if (comet.angle > Math.PI * 2) comet.angle -= Math.PI * 2;
      if (comet.angle < 0) comet.angle += Math.PI * 2;
    });

    this.render();
    this.rafId = requestAnimationFrame(() => this.tick());
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.nodeBounds.clear();

    // 1. Deep Atmospheric Nebula Glow
    this.renderAtmosphere();

    // 2. Spinning 3D Crystalline Octahedron Core
    this.renderCrystallineCore();

    // 3. Geodesic Parallels & Meridians
    this.renderGeodesicGrid();

    // 4. Armillary Orbital Rings & Comets
    this.renderArmillaryRings();

    // 5. Parabolic Inter-Language Harmonic Arcs
    this.renderHarmonicArcs();

    // 6. Active Sonar Ripples
    this.renderSonarRipples();

    // 7. Depth-Sorted Elements: Stars and Language Nodes
    this.renderSortedElements();
  }

  renderAtmosphere() {
    const pulse = Math.sin(this.time * 1.5) * 0.05;
    const glowGrad = this.ctx.createRadialGradient(
      this.cx, this.cy, this.radius * 0.15,
      this.cx, this.cy, this.radius * 1.45
    );
    glowGrad.addColorStop(0, 'rgba(23, 53, 47, 0.65)');
    glowGrad.addColorStop(0.35, `rgba(23, 53, 47, ${0.35 + pulse})`);
    glowGrad.addColorStop(0.7, 'rgba(183, 149, 91, 0.06)');
    glowGrad.addColorStop(1, 'rgba(17, 19, 19, 0)');

    this.ctx.fillStyle = glowGrad;
    this.ctx.beginPath();
    this.ctx.arc(this.cx, this.cy, this.radius * 1.45, 0, Math.PI * 2);
    this.ctx.fill();
  }

  renderCrystallineCore() {
    const coreR = this.radius * 0.28;
    // Octahedron 6 vertices in core local space
    const localVerts = [
      { x: 0, y: -coreR, z: 0 }, // 0: Top
      { x: 0, y: coreR, z: 0 },  // 1: Bottom
      { x: coreR, y: 0, z: 0 },   // 2: Right
      { x: 0, y: 0, z: coreR },   // 3: Front
      { x: -coreR, y: 0, z: 0 },  // 4: Left
      { x: 0, y: 0, z: -coreR }   // 5: Back
    ];

    // Independent rotation of the core
    const cosCY = Math.cos(this.coreAngleY);
    const sinCY = Math.sin(this.coreAngleY);
    const cosCX = Math.cos(this.coreAngleX);
    const sinCX = Math.sin(this.coreAngleX);

    const projVerts = localVerts.map(v => {
      // Core local rotation
      const x1 = v.x * cosCY - v.z * sinCY;
      const z1 = v.z * cosCY + v.x * sinCY;
      const y2 = v.y * cosCX - z1 * sinCX;
      const z2 = z1 * cosCX + v.y * sinCX;

      // Project through main sphere rotation
      return this.project(x1, y2, z2);
    });

    const faces = [
      [0, 2, 3], [0, 3, 4], [0, 4, 5], [0, 5, 2], // Top 4 triangular faces
      [1, 3, 2], [1, 4, 3], [1, 5, 4], [1, 2, 5]  // Bottom 4 triangular faces
    ];

    this.ctx.save();

    // 1. Shaded Translucent Faces with depth lighting
    faces.forEach(face => {
      const p1 = projVerts[face[0]];
      const p2 = projVerts[face[1]];
      const p3 = projVerts[face[2]];

      // Cross product for front-facing check (2D winding)
      const cross = (p2.px - p1.px) * (p3.py - p1.py) - (p2.py - p1.py) * (p3.px - p1.px);
      const isFront = cross < 0;

      if (isFront) {
        this.ctx.fillStyle = 'rgba(183, 149, 91, 0.08)';
        this.ctx.beginPath();
        this.ctx.moveTo(p1.px, p1.py);
        this.ctx.lineTo(p2.px, p2.py);
        this.ctx.lineTo(p3.px, p3.py);
        this.ctx.closePath();
        this.ctx.fill();
      }
    });

    // 2. Glowing Edges
    const edges = [
      [0, 2], [0, 3], [0, 4], [0, 5],
      [1, 2], [1, 3], [1, 4], [1, 5],
      [2, 3], [3, 4], [4, 5], [5, 2]
    ];

    this.ctx.lineWidth = 1.1;
    edges.forEach(([i, j]) => {
      const p1 = projVerts[i];
      const p2 = projVerts[j];
      const avgZ = (p1.z + p2.z) / 2;
      const isFront = avgZ < 0;

      this.ctx.strokeStyle = isFront ? 'rgba(183, 149, 91, 0.8)' : 'rgba(23, 53, 47, 0.45)';
      this.ctx.beginPath();
      this.ctx.moveTo(p1.px, p1.py);
      this.ctx.lineTo(p2.px, p2.py);
      this.ctx.stroke();
    });

    // 3. Central Radiant Jewel with Starburst
    const centerProj = this.project(0, 0, 0);
    const jewelPulse = 3.2 + Math.sin(this.time * 3) * 1.2;

    const jewelGrad = this.ctx.createRadialGradient(
      centerProj.px, centerProj.py, 0,
      centerProj.px, centerProj.py, jewelPulse * 3.8
    );
    jewelGrad.addColorStop(0, '#FFFFFF');
    jewelGrad.addColorStop(0.3, 'rgba(183, 149, 91, 0.95)');
    jewelGrad.addColorStop(0.8, 'rgba(23, 53, 47, 0.35)');
    jewelGrad.addColorStop(1, 'transparent');

    this.ctx.fillStyle = jewelGrad;
    this.ctx.beginPath();
    this.ctx.arc(centerProj.px, centerProj.py, jewelPulse * 3.8, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  renderGeodesicGrid() {
    this.ctx.save();

    // 1. Longitude Meridians (4 full ellipses through poles)
    const meridianAngles = [0, Math.PI / 4, Math.PI / 2, Math.PI * 0.75];
    const segments = 36;

    meridianAngles.forEach(mAngle => {
      const cosM = Math.cos(mAngle);
      const sinM = Math.sin(mAngle);

      this.ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        const u = (i / segments) * Math.PI * 2;
        const x = this.radius * Math.sin(u) * cosM;
        const y = this.radius * Math.cos(u);
        const z = this.radius * Math.sin(u) * sinM;

        const p = this.project(x, y, z);
        if (i === 0) this.ctx.moveTo(p.px, p.py);
        else this.ctx.lineTo(p.px, p.py);
      }
      this.ctx.strokeStyle = 'rgba(216, 203, 184, 0.08)';
      this.ctx.lineWidth = 0.8;
      this.ctx.stroke();
    });

    // 2. Latitude Parallels (Tropics at y = ±0.52 * radius)
    [-0.52, 0.52].forEach(latNorm => {
      const latY = this.radius * latNorm;
      const latR = Math.sqrt(Math.max(0, this.radius * this.radius - latY * latY));

      this.ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        const u = (i / segments) * Math.PI * 2;
        const x = latR * Math.cos(u);
        const z = latR * Math.sin(u);

        const p = this.project(x, latY, z);
        if (i === 0) this.ctx.moveTo(p.px, p.py);
        else this.ctx.lineTo(p.px, p.py);
      }
      this.ctx.strokeStyle = 'rgba(23, 53, 47, 0.35)';
      this.ctx.lineWidth = 0.9;
      this.ctx.stroke();
    });

    this.ctx.restore();
  }

  renderArmillaryRings() {
    this.ctx.save();

    this.rings.forEach((ring, idx) => {
      const segments = 64;
      const points = [];

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

        points.push({
          rawX: x, rawY: y, rawZ: z,
          proj: this.project(x, y, z)
        });
      }

      // Draw Ring Track in depth segments
      if (ring.isAstrolabe) {
        // Outer Astrolabe Navigational Dial Ring
        this.ctx.beginPath();
        points.forEach((pt, i) => {
          if (i === 0) this.ctx.moveTo(pt.proj.px, pt.proj.py);
          else this.ctx.lineTo(pt.proj.px, pt.proj.py);
        });
        this.ctx.strokeStyle = 'rgba(183, 149, 91, 0.28)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        // Degree ticks around the astrolabe dial (24 divisions)
        for (let t = 0; t < 24; t++) {
          const tAngle = (t / 24) * Math.PI * 2;
          let xA = ring.radius * Math.cos(tAngle);
          let yA = ring.radius * Math.sin(tAngle) * Math.sin(ring.tilt);
          let zA = ring.radius * Math.sin(tAngle) * Math.cos(ring.tilt);
          let xB = (ring.radius + (t % 6 === 0 ? 7 : 4)) * Math.cos(tAngle);
          let yB = (ring.radius + (t % 6 === 0 ? 7 : 4)) * Math.sin(tAngle) * Math.sin(ring.tilt);
          let zB = (ring.radius + (t % 6 === 0 ? 7 : 4)) * Math.sin(tAngle) * Math.cos(ring.tilt);

          const pA = this.project(xA, yA, zA);
          const pB = this.project(xB, yB, zB);

          this.ctx.beginPath();
          this.ctx.moveTo(pA.px, pA.py);
          this.ctx.lineTo(pB.px, pB.py);
          this.ctx.strokeStyle = t % 6 === 0 ? 'rgba(183, 149, 91, 0.65)' : 'rgba(183, 149, 91, 0.22)';
          this.ctx.lineWidth = t % 6 === 0 ? 1.4 : 0.8;
          this.ctx.stroke();
        }
      } else {
        // Primary Ecliptic & Equator Rings
        this.ctx.beginPath();
        points.forEach((pt, i) => {
          if (i === 0) this.ctx.moveTo(pt.proj.px, pt.proj.py);
          else this.ctx.lineTo(pt.proj.px, pt.proj.py);
        });

        if (ring.isEcliptic) {
          this.ctx.strokeStyle = 'rgba(183, 149, 91, 0.38)';
          this.ctx.lineWidth = 1.3;
        } else {
          this.ctx.strokeStyle = 'rgba(216, 203, 184, 0.16)';
          this.ctx.lineWidth = 0.9;
        }
        this.ctx.stroke();
      }

      // Render Comet on this ring if assigned
      const comet = this.comets.find(c => c.ringIdx === idx);
      if (comet) {
        this.renderCometOnRing(ring, comet);
      }
    });

    this.ctx.restore();
  }

  renderCometOnRing(ring, comet) {
    const tailSegments = 10;
    const trailSpan = 0.22; // radians of tail

    for (let s = tailSegments; s >= 0; s--) {
      const segAngle = comet.angle - (s / tailSegments) * trailSpan;
      let x = ring.radius * Math.cos(segAngle);
      let y = ring.radius * Math.sin(segAngle) * Math.sin(ring.tilt);
      let z = ring.radius * Math.sin(segAngle) * Math.cos(ring.tilt);

      if (ring.pitch !== 0) {
        const cosP = Math.cos(ring.pitch);
        const sinP = Math.sin(ring.pitch);
        const x2 = x * cosP + y * sinP;
        const y2 = -x * sinP + y * cosP;
        x = x2;
        y = y2;
      }

      const proj = this.project(x, y, z);
      const isFront = proj.z < 0;
      const alpha = isFront ? (1 - s / tailSegments) : (1 - s / tailSegments) * 0.25;

      if (s === 0) {
        // Comet Head (Luminous glowing photon)
        this.ctx.save();
        this.ctx.shadowColor = comet.glow;
        this.ctx.shadowBlur = isFront ? 14 : 4;
        this.ctx.fillStyle = comet.color;
        this.ctx.beginPath();
        this.ctx.arc(proj.px, proj.py, (comet.size * (isFront ? 1 : 0.65)) * proj.scale, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      } else {
        // Comet Tail Segment
        this.ctx.fillStyle = `rgba(183, 149, 91, ${alpha * 0.45})`;
        this.ctx.beginPath();
        this.ctx.arc(proj.px, proj.py, ((comet.size - 1) * (1 - s / tailSegments)) * proj.scale, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }

  renderHarmonicArcs() {
    const activeNode = this.languageNodes.find(n => n.id === this.activeId) || this.languageNodes[0];

    // Convert spherical (phi, theta) to unit vector
    const getUnitVec = (node) => ({
      x: Math.cos(node.phi) * Math.cos(node.theta),
      y: Math.sin(node.theta),
      z: Math.sin(node.phi) * Math.cos(node.theta)
    });

    const activeV = getUnitVec(activeNode);

    this.ctx.save();

    this.languageNodes.forEach(otherNode => {
      if (otherNode.id === activeNode.id) return;
      const otherV = getUnitVec(otherNode);

      // Great-circle interpolation (SLERP)
      const dot = Math.max(-1, Math.min(1, activeV.x * otherV.x + activeV.y * otherV.y + activeV.z * otherV.z));
      const omega = Math.acos(dot);
      if (omega < 0.001) return;
      const sinOmega = Math.sin(omega);

      const segments = 24;
      const arcPoints = [];

      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const w1 = Math.sin((1 - t) * omega) / sinOmega;
        const w2 = Math.sin(t * omega) / sinOmega;

        // Subtle parabolic lift above sphere surface for a true transatlantic flight bridge
        const lift = Math.sin(t * Math.PI) * (this.radius * 0.12);
        const rCurrent = this.radius * 1.04 + lift;

        const x = (w1 * activeV.x + w2 * otherV.x) * rCurrent;
        const y = (w1 * activeV.y + w2 * otherV.y) * rCurrent;
        const z = (w1 * activeV.z + w2 * otherV.z) * rCurrent;

        arcPoints.push(this.project(x, y, z));
      }

      // Draw Parabolic Harmonic Arc
      this.ctx.beginPath();
      arcPoints.forEach((pt, i) => {
        if (i === 0) this.ctx.moveTo(pt.px, pt.py);
        else this.ctx.lineTo(pt.px, pt.py);
      });

      this.ctx.strokeStyle = 'rgba(183, 149, 91, 0.25)';
      this.ctx.lineWidth = 1.1;
      this.ctx.setLineDash([3, 4]);
      this.ctx.stroke();
      this.ctx.setLineDash([]);

      // Traveling Energy Spark along the harmonic arc
      const sparkT = (this.time * 0.45 + (activeNode.id.charCodeAt(0) % 5) * 0.2) % 1;
      const sparkIdx = Math.floor(sparkT * segments);
      const nextIdx = Math.min(segments, sparkIdx + 1);
      const frac = (sparkT * segments) - sparkIdx;

      const pA = arcPoints[sparkIdx];
      const pB = arcPoints[nextIdx];
      if (pA && pB) {
        const sX = pA.px + (pB.px - pA.px) * frac;
        const sY = pA.py + (pB.py - pA.py) * frac;
        const sZ = pA.z + (pB.z - pA.z) * frac;
        const isFront = sZ < 0;

        if (isFront) {
          this.ctx.fillStyle = '#FFFFFF';
          this.ctx.shadowColor = '#FFE8B0';
          this.ctx.shadowBlur = 8;
          this.ctx.beginPath();
          this.ctx.arc(sX, sY, 2.2, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.shadowBlur = 0;
        }
      }
    });

    this.ctx.restore();
  }

  renderSonarRipples() {
    this.ripples.forEach(rip => {
      const rOrbit = this.radius * 1.05;
      const center = {
        x: rOrbit * Math.cos(rip.phi) * Math.cos(rip.theta),
        y: rOrbit * Math.sin(rip.theta),
        z: rOrbit * Math.sin(rip.phi) * Math.cos(rip.theta)
      };

      const proj = this.project(center.x, center.y, center.z);
      if (proj.z > 50) return; // Hide if deep on back

      const currRadius = rip.progress * rip.maxRadius * proj.scale;
      const alpha = (1 - rip.progress) * 0.65;

      this.ctx.save();
      this.ctx.strokeStyle = `rgba(183, 149, 91, ${alpha})`;
      this.ctx.lineWidth = 1.4;
      this.ctx.shadowColor = rip.color;
      this.ctx.shadowBlur = 8;
      this.ctx.beginPath();
      this.ctx.arc(proj.px, proj.py, currRadius, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    });
  }

  renderSortedElements() {
    const renderQueue = [];

    // 1. Constellation Surface Stars
    this.surfacePoints.forEach(pt => {
      const proj = this.project(pt.x, pt.y, pt.z);
      renderQueue.push({
        type: 'star',
        z: proj.z,
        px: proj.px,
        py: proj.py,
        scale: proj.scale,
        size: pt.size,
        alpha: pt.alpha,
        twinklePhase: pt.twinklePhase,
        twinkleSpeed: pt.twinkleSpeed,
        isMajorStar: pt.isMajorStar
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
        type: 'node',
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
      if (item.type === 'star') {
        this.drawStar(item);
      } else if (item.type === 'node') {
        this.drawAerospaceNode(item);
      }
    });
  }

  drawStar(star) {
    const isFront = star.z < 0;
    const twinkle = 0.75 + 0.25 * Math.sin(this.time * star.twinkleSpeed + star.twinklePhase);
    const alpha = isFront
      ? Math.min(0.95, star.alpha * star.scale * twinkle)
      : Math.max(0.06, star.alpha * 0.22 * star.scale);

    this.ctx.fillStyle = isFront ? `rgba(244, 240, 232, ${alpha})` : `rgba(23, 53, 47, ${alpha})`;
    this.ctx.beginPath();
    this.ctx.arc(star.px, star.py, star.size * star.scale, 0, Math.PI * 2);
    this.ctx.fill();

    // 4-point cross-glint on major front stars
    if (isFront && star.isMajorStar && star.z < -this.radius * 0.3) {
      const len = 4.2 * star.scale;
      this.ctx.strokeStyle = `rgba(183, 149, 91, ${alpha * 0.75})`;
      this.ctx.lineWidth = 0.75;
      this.ctx.beginPath();
      this.ctx.moveTo(star.px - len, star.py);
      this.ctx.lineTo(star.px + len, star.py);
      this.ctx.moveTo(star.px, star.py - len);
      this.ctx.lineTo(star.px, star.py + len);
      this.ctx.stroke();
    }
  }

  drawAerospaceNode(item) {
    const isFront = item.z < 35;
    const isActive = item.node.id === this.activeId;
    const isHovered = item.node.id === this.hoveredId;
    const node = item.node;

    const baseAlpha = isFront
      ? Math.min(1, 0.45 + (1 - (item.z / -this.radius)) * 0.55)
      : Math.max(0.18, 0.35 - (item.z / this.radius) * 0.25);

    this.ctx.save();
    this.ctx.translate(item.px, item.py);

    const scaleFactor = item.scale * (isActive ? 1.08 : (isHovered ? 1.04 : 1.0));
    this.ctx.scale(scaleFactor, scaleFactor);

    if (isFront) {
      // --------------------------------------------------------
      // FRONT-FACING AEROSPACE HUD PLACARD
      // --------------------------------------------------------
      const boxH = 40;
      const scriptFont = '600 13px "Playfair Display", "Noto Sans Tamil", "Noto Sans Malayalam", "Noto Sans JP", sans-serif';
      const subFont = '600 8px "DM Mono", monospace';
      const tagFont = '500 7px "DM Mono", monospace';

      this.ctx.font = scriptFont;
      const wScript = this.ctx.measureText(node.text).width;

      this.ctx.font = subFont;
      const subText = `${node.sub} ${node.ipa}`;
      const wSub = this.ctx.measureText(subText).width;

      this.ctx.font = tagFont;
      const wTag = this.ctx.measureText(node.coord).width;

      const boxW = Math.max(122, Math.ceil(Math.max(wScript + wTag + 34, wSub + 30)));

      // Smart flip: if anchor is on the right hemisphere, flip placard to left to prevent canvas edge clipping
      const isRightHalf = item.px > this.cx;
      const boxX = isRightHalf ? (-boxW - 10) : 10;
      const boxY = -boxH / 2;

      // Register screen hit-test bounding box for click/hover
      const minX = item.px + boxX * scaleFactor;
      const minY = item.py + boxY * scaleFactor;
      const maxX = minX + boxW * scaleFactor;
      const maxY = minY + boxH * scaleFactor;
      this.nodeBounds.set(node.id, { minX, minY, maxX, maxY });

      // Holographic Glass Container
      this.ctx.save();
      if (isActive || isHovered) {
        this.ctx.shadowColor = isActive ? 'rgba(183, 149, 91, 0.85)' : 'rgba(244, 240, 232, 0.5)';
        this.ctx.shadowBlur = isActive ? 18 : 10;
      }

      this.ctx.fillStyle = `rgba(13, 20, 18, ${0.92 * baseAlpha})`;
      this.ctx.strokeStyle = isActive
        ? `rgba(183, 149, 91, ${0.95 * baseAlpha})`
        : (isHovered ? `rgba(244, 240, 232, ${0.85 * baseAlpha})` : `rgba(183, 149, 91, ${0.45 * baseAlpha})`);
      this.ctx.lineWidth = isActive ? 1.5 : 1;

      this.ctx.beginPath();
      if (typeof this.ctx.roundRect === 'function') {
        this.ctx.roundRect(boxX, boxY, boxW, boxH, 4);
      } else {
        this.ctx.rect(boxX, boxY, boxW, boxH);
      }
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.restore();

      // Precision Aerospace Corner Bracket Ticks
      const bLen = 4;
      this.ctx.strokeStyle = isActive ? 'rgba(244, 240, 232, 0.9)' : 'rgba(183, 149, 91, 0.7)';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      // Top-Left
      this.ctx.moveTo(boxX, boxY + bLen); this.ctx.lineTo(boxX, boxY); this.ctx.lineTo(boxX + bLen, boxY);
      // Top-Right
      this.ctx.moveTo(boxX + boxW - bLen, boxY); this.ctx.lineTo(boxX + boxW, boxY); this.ctx.lineTo(boxX + boxW, boxY + bLen);
      // Bottom-Left
      this.ctx.moveTo(boxX, boxY + boxH - bLen); this.ctx.lineTo(boxX, boxY + boxH); this.ctx.lineTo(boxX + bLen, boxY + boxH);
      // Bottom-Right
      this.ctx.moveTo(boxX + boxW - bLen, boxY + boxH); this.ctx.lineTo(boxX + boxW, boxY + boxH); this.ctx.lineTo(boxX + boxW, boxY + boxH - bLen);
      this.ctx.stroke();

      // Glowing LED Status Beacon Dot
      this.ctx.save();
      this.ctx.fillStyle = isActive ? '#52C79A' : node.color;
      this.ctx.shadowColor = isActive ? '#52C79A' : node.glow;
      this.ctx.shadowBlur = 8;
      this.ctx.beginPath();
      this.ctx.arc(boxX + 10, boxY + 14, 2.8, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();

      // Native Script Title
      this.ctx.fillStyle = `rgba(244, 240, 232, ${baseAlpha})`;
      this.ctx.font = scriptFont;
      this.ctx.textAlign = 'left';
      this.ctx.fillText(node.text, boxX + 18, boxY + 18);

      // Coordinate Tag Badge
      const tagX = boxX + boxW - 8;
      this.ctx.font = tagFont;
      this.ctx.fillStyle = isActive ? 'rgba(183, 149, 91, 0.95)' : 'rgba(216, 203, 184, 0.6)';
      this.ctx.textAlign = 'right';
      this.ctx.fillText(node.coord, tagX, boxY + 17);

      // Subtitle & Phonetic IPA
      this.ctx.fillStyle = isActive ? 'rgba(183, 149, 91, 1)' : `rgba(183, 149, 91, ${baseAlpha * 0.85})`;
      this.ctx.font = subFont;
      this.ctx.textAlign = 'left';
      this.ctx.fillText(subText, boxX + 10, boxY + 31);

      // Anchor Core Connector Dot on Globe
      this.ctx.save();
      this.ctx.fillStyle = isActive ? '#FFFFFF' : node.color;
      this.ctx.shadowColor = node.glow;
      this.ctx.shadowBlur = 10;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, isActive ? 4.5 : 3.5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();

      // Connecting lead line from Anchor to Placard
      this.ctx.strokeStyle = `rgba(183, 149, 91, ${0.45 * baseAlpha})`;
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(isRightHalf ? -10 : 10, 0);
      this.ctx.stroke();

    } else {
      // --------------------------------------------------------
      // BACK-FACING ETHEREAL HUD CHIP
      // --------------------------------------------------------
      const chipW = 56;
      const chipH = 18;
      const chipX = -chipW / 2;
      const chipY = -chipH / 2;

      this.ctx.fillStyle = `rgba(13, 20, 18, ${0.65 * baseAlpha})`;
      this.ctx.strokeStyle = `rgba(23, 53, 47, ${0.5 * baseAlpha})`;
      this.ctx.lineWidth = 0.8;

      this.ctx.beginPath();
      if (typeof this.ctx.roundRect === 'function') {
        this.ctx.roundRect(chipX, chipY, chipW, chipH, 3);
      } else {
        this.ctx.rect(chipX, chipY, chipW, chipH);
      }
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = `rgba(216, 203, 184, ${baseAlpha * 0.65})`;
      this.ctx.font = '500 9.5px "Playfair Display", "Noto Sans Tamil", "Noto Sans Malayalam", "Noto Sans JP", sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(node.text, 0, 4);

      // Dim anchor dot
      this.ctx.fillStyle = 'rgba(23, 53, 47, 0.4)';
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }
}
