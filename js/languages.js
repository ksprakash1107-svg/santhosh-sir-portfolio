/**
 * Five Languages Interactive Showcase Controller
 * Handles interactive language card focus, hover, keyboard navigation,
 * and synchronizes with the 3D Global Language Sphere.
 */

import { PORTFOLIO_CONFIG } from './data.js';

export class LanguageShowcaseController {
  constructor(sphereInstance, cursorInstance = null) {
    this.sphere = sphereInstance;
    this.cursor = cursorInstance;
    this.container = document.getElementById('language-showcase-container');
    this.detailContainer = document.getElementById('language-active-detail');
    this.cards = [];
    this.activeId = 'tamil';

    if (this.container) {
      this.init();
    }
  }

  init() {
    this.renderCards();
    this.bindEvents();
    if (this.sphere) {
      this.sphere.onSelectLanguage = (langId) => {
        this.updateActiveState(langId, false);
      };
    }
    this.updateActiveState('tamil', false);
  }

  renderCards() {
    const existingCards = this.container.querySelectorAll('.language-card');
    if (existingCards.length === PORTFOLIO_CONFIG.languages.length) {
      this.cards = Array.from(existingCards);
      return;
    }

    this.container.innerHTML = PORTFOLIO_CONFIG.languages.map((lang, index) => `
      <article
        class="language-card ${index === 0 ? 'active' : ''}"
        data-lang-id="${lang.id}"
        tabindex="0"
        role="button"
        aria-pressed="${index === 0 ? 'true' : 'false'}"
        aria-label="${lang.name} language details"
      >
        <span class="lang-order-tag">${lang.order} / 05</span>
        <div class="lang-script-glance script-${lang.id}">${lang.script}</div>
        <div class="lang-title-row">
          <span class="lang-english-title">${lang.name}</span>
          <span class="lang-ipa-tag">${lang.ipa}</span>
        </div>
        <div class="lang-region-meta">${lang.nativeFamily}</div>
        <div class="lang-tagline-text">${lang.tagline}</div>
        <div class="lang-narrative-detail">${lang.perspective}</div>
      </article>
    `).join('');

    this.cards = Array.from(this.container.querySelectorAll('.language-card'));
  }

  bindEvents() {
    this.cards.forEach(card => {
      const langId = card.getAttribute('data-lang-id');

      // Hover
      card.addEventListener('mouseenter', () => {
        this.updateActiveState(langId, true);
      });

      // Click
      card.addEventListener('click', () => {
        this.updateActiveState(langId, true);
      });

      // Keyboard Focus
      card.addEventListener('focus', () => {
        this.updateActiveState(langId, true);
      });

      // Keyboard Activate
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.updateActiveState(langId, true);
        }
      });
    });
  }

  updateActiveState(langId, syncSphere = true) {
    this.activeId = langId;
    const selectedLang = PORTFOLIO_CONFIG.languages.find(l => l.id === langId);

    this.cards.forEach(card => {
      const isCurrent = card.getAttribute('data-lang-id') === langId;
      card.classList.toggle('active', isCurrent);
      card.setAttribute('aria-pressed', isCurrent ? 'true' : 'false');
    });

    // Update active editorial detail banner if present
    if (this.detailContainer && selectedLang) {
      this.detailContainer.innerHTML = `
        <div class="active-lang-editorial reveal is-revealed">
          <div class="editorial-lang-head">
            <span class="lang-badge">${selectedLang.order}</span>
            <span class="lang-focus-script script-${selectedLang.id}">${selectedLang.script}</span>
            <span class="lang-focus-title">${selectedLang.name.toUpperCase()}</span>
            <span class="lang-ipa-tag">${selectedLang.ipa}</span>
          </div>
          <p class="lang-focus-desc">${selectedLang.perspective}</p>
          <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
            <span class="lang-region-tag">${selectedLang.region}</span>
            <span class="mono-label" style="color: var(--text-gold);">· ${selectedLang.tagline}</span>
          </div>
        </div>
      `;
    }

    // Pivot 3D Sphere if available
    if (this.sphere) {
      if (syncSphere && typeof this.sphere.focusLanguage === 'function') {
        this.sphere.focusLanguage(langId);
      } else if (typeof this.sphere.setActiveLanguage === 'function') {
        this.sphere.setActiveLanguage(langId);
      }
    }

    // Sync Polyglot Cursor if available
    if (this.cursor && typeof this.cursor.setActiveLanguage === 'function') {
      this.cursor.setActiveLanguage(langId);
    }
  }
}
