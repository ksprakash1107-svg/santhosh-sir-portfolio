/**
 * Master Application Bootstrap
 * Santhosh S. — Personal Brand Portfolio
 */

import { PORTFOLIO_CONFIG } from './data.js';
import { GlobalLanguageSphere } from './sphere3d.js';
import { LanguageShowcaseController } from './languages.js';
import { InteractionsController } from './interactions.js';
import {
  LinguisticConstellation,
  MagneticButtonController,
  PolyglotCipher,
  CardTiltEffect,
  PolyglotPreloader
} from './effects.js';

document.addEventListener('DOMContentLoaded', () => {
  // 0. Initialize Polyglot Genesis Preloader (5 Languages Touch)
  const preloader = new PolyglotPreloader();

  // 1. Render Timeline Steps from Verified Data
  renderTimeline();

  // 2. Render Editorial Metrics from Verified Data
  renderMetrics();

  // 3. Initialize Celestial Linguistic Constellation (Hero Canvas)
  const constellation = new LinguisticConstellation('hero-constellation-canvas');

  // 4. Initialize 3D Language Sphere
  const sphere = new GlobalLanguageSphere('sphere-3d-canvas', 'sphere-fallback-box');

  // 5. Initialize Interactions (Scroll progress, tabs, modal, polyglot cursor)
  const interactions = new InteractionsController();

  // 6. Initialize Five Languages Showcase & link with Sphere & Cursor
  const languagesController = new LanguageShowcaseController(sphere, interactions.cursor);

  // 7. Initialize Haute-Couture Visual Effects (Magnetic buttons, Polyglot cipher, 3D card tilt)
  const magneticButtons = new MagneticButtonController();
  const cipher = new PolyglotCipher();
  const cardTilt = new CardTiltEffect();

  // 8. Handle LinkedIn Link Action
  setupLinkedInAction();

  // 9. Handle scroll target parameter if present (e.g. ?scroll=languages)
  const scrollTarget = new URLSearchParams(window.location.search).get('scroll');
  if (scrollTarget) {
    const targetEl = document.getElementById(scrollTarget);
    if (targetEl) {
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, targetEl.offsetTop - 60);
    }
  }
});

function renderTimeline() {
  const container = document.getElementById('timeline-steps-container');
  if (!container || container.children.length > 0) return;

  container.innerHTML = PORTFOLIO_CONFIG.timeline.map((step, idx) => `
    <article class="timeline-step reveal delay-${idx} ${step.highlight ? 'highlight-germany' : ''}">
      <span class="timeline-step-marker"></span>
      <span class="timeline-step-epoch">${step.epoch}</span>
      <h3>${step.title}</h3>
      <p class="timeline-submeta" style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-gold); margin-bottom: 0.5rem;">${step.subtitle}</p>
      <p>${step.narrative}</p>
    </article>
  `).join('');
}

function renderMetrics() {
  const container = document.getElementById('metrics-strip-container');
  if (!container || container.children.length > 0) return;

  container.innerHTML = PORTFOLIO_CONFIG.metrics.map((m, idx) => `
    <div class="metric-block reveal delay-${idx}">
      <div class="metric-num">${m.value.replace('+', '<em>+</em>')}</div>
      <div class="metric-label">${m.label}</div>
      <div class="metric-submeta">${m.meta}</div>
    </div>
  `).join('');
}

function setupLinkedInAction() {
  const linkedinLinks = document.querySelectorAll('[data-linkedin-link]');
  linkedinLinks.forEach(link => {
    if (PORTFOLIO_CONFIG.links.linkedin && PORTFOLIO_CONFIG.links.linkedin !== "ADD_LINKEDIN_URL_HERE") {
      link.href = PORTFOLIO_CONFIG.links.linkedin;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    } else {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        showEditorialToast("LinkedIn Profile URL: Configured as a verified placeholder in js/data.js (LINKEDIN_URL = 'ADD_LINKEDIN_URL_HERE'). Replace with the verified profile link when ready.");
      });
    }
  });
}

function showEditorialToast(message) {
  let toast = document.getElementById('editorial-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'editorial-toast';
    toast.className = 'editorial-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-indicator">VERIFIED NOTE</span>
      <p>${message}</p>
      <button class="toast-close" aria-label="Close notification" onclick="document.getElementById('editorial-toast').classList.remove('visible')">✕</button>
    </div>
  `;
  toast.classList.add('visible');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    if (toast) toast.classList.remove('visible');
  }, 6000);
}
