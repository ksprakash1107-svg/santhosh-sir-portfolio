/**
 * Interactions Controller
 * Coordinates scroll progress, header styling, mobile navigation,
 * test preparation tab selection, enquiry modal, and scroll reveal effects.
 */

import { PORTFOLIO_CONFIG } from './data.js';

export class InteractionsController {
  constructor() {
    this.initScrollProgress();
    this.initHeaderScrolled();
    this.initMobileNav();
    this.initScrollSpy();
    this.initScrollReveals();
    this.initTestPrepTabs();
    this.initEnquiryModal();
    this.initCustomCursor();
  }

  // 1. Scroll Progress Indicator
  initScrollProgress() {
    const progressBar = document.querySelector('.scroll-progress-bar');
    if (!progressBar) return;

    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      progressBar.style.width = `${progress}%`;
    }, { passive: true });
  }

  // 2. Header Backdrop Transition on Scroll
  initHeaderScrolled() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const checkHeader = () => {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', checkHeader, { passive: true });
    checkHeader();
  }

  // 3. Mobile Navigation Drawer
  initMobileNav() {
    const toggleBtn = document.querySelector('.mobile-nav-toggle');
    const drawer = document.querySelector('.mobile-nav-drawer');
    const backdrop = document.querySelector('.mobile-nav-backdrop');
    const drawerLinks = document.querySelectorAll('.mobile-nav-links a');

    if (!toggleBtn || !drawer || !backdrop) return;

    const openDrawer = () => {
      drawer.classList.add('open');
      backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
      toggleBtn.setAttribute('aria-expanded', 'true');
    };

    const closeDrawer = () => {
      drawer.classList.remove('open');
      backdrop.classList.remove('open');
      document.body.style.overflow = '';
      toggleBtn.setAttribute('aria-expanded', 'false');
    };

    toggleBtn.addEventListener('click', () => {
      const isOpen = drawer.classList.contains('open');
      if (isOpen) closeDrawer();
      else openDrawer();
    });

    backdrop.addEventListener('click', closeDrawer);

    drawerLinks.forEach(link => {
      link.addEventListener('click', closeDrawer);
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        closeDrawer();
      }
    });
  }

  // 4. ScrollSpy Active Nav Link
  initScrollSpy() {
    const navLinks = document.querySelectorAll('.desktop-nav .nav-link');
    const sections = Array.from(document.querySelectorAll('section[id]'));

    if (!navLinks.length || !sections.length) return;

    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY + 120;
      let currentSectionId = '';

      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i];
        if (sec.offsetTop <= scrollPos) {
          currentSectionId = sec.getAttribute('id');
          break;
        }
      }

      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${currentSectionId}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }, { passive: true });
  }

  // 5. Scroll Reveals
  initScrollReveals() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    // Immediately reveal elements that are already in or near the viewport
    const checkVisible = () => {
      const vh = window.innerHeight || 800;
      reveals.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < vh + 100) {
          el.classList.add('is-revealed');
        }
      });
    };

    checkVisible();
    window.addEventListener('scroll', checkVisible, { passive: true });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      }, { rootMargin: '120px 0px 120px 0px', threshold: 0.01 });

      reveals.forEach(el => observer.observe(el));
    }
  }

  // 6. Test Preparation Interactive Matrix
  initTestPrepTabs() {
    const tabsContainer = document.getElementById('testprep-tabs-bar');
    const contentPanel = document.getElementById('testprep-display-panel');

    if (!tabsContainer || !contentPanel) return;

    // Render tab buttons if not already pre-rendered
    if (tabsContainer.children.length === 0) {
      tabsContainer.innerHTML = PORTFOLIO_CONFIG.testPrep.map((item, idx) => `
        <button
          class="testprep-tab-btn ${idx === 0 ? 'active' : ''}"
          data-prep-id="${item.id}"
          role="tab"
          aria-selected="${idx === 0 ? 'true' : 'false'}"
          aria-controls="testprep-display-panel"
        >
          <span class="tab-num">${item.code}</span>
          <span>${item.name}</span>
        </button>
      `).join('');
    }

    const updatePanel = (prepId) => {
      const item = PORTFOLIO_CONFIG.testPrep.find(d => d.id === prepId) || PORTFOLIO_CONFIG.testPrep[0];

      // Update button styles
      tabsContainer.querySelectorAll('.testprep-tab-btn').forEach(btn => {
        const isMatch = btn.getAttribute('data-prep-id') === prepId;
        btn.classList.toggle('active', isMatch);
        btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
      });

      // Update panel content
      contentPanel.innerHTML = `
        <div class="testprep-info reveal is-revealed">
          <span class="testprep-tagline">${item.code} · ${item.tagline}</span>
          <h3>${item.name}</h3>
          <p>${item.description}</p>
          <ul class="testprep-pillars-list">
            ${item.pillars.map(p => `<li>${p}</li>`).join('')}
          </ul>
        </div>
        <div class="testprep-stat-box reveal is-revealed delay-1">
          <div class="testprep-stat-item">
            <strong>${item.metricTitle}</strong>
            <span>${item.metricSub}</span>
          </div>
          <div class="testprep-stat-item">
            <strong>Individual Focus</strong>
            <span>Diagnostic Calibration</span>
          </div>
          <button class="btn-primary" data-open-enquiry style="margin-top: 0.5rem; justify-content: center;" aria-label="Enquire for Training">
            <span class="btn-beam" aria-hidden="true"></span>
            <span class="btn-core">
              <span class="btn-specular" aria-hidden="true"></span>
              <span class="btn-beacon" aria-hidden="true"></span>
              <span class="btn-label">Enquire for Training</span>
              <span class="btn-talisman" aria-hidden="true">↗</span>
            </span>
          </button>
        </div>
      `;

      // Re-bind enquiry trigger for newly injected button
      const modalBtn = contentPanel.querySelector('[data-open-enquiry]');
      const modal = document.getElementById('enquiry-modal');
      const form = document.getElementById('enquiry-form');
      const successMsg = document.getElementById('modal-success-msg');
      if (modalBtn && modal) {
        modalBtn.addEventListener('click', (e) => {
          e.preventDefault();
          modal.showModal();
          if (form) {
            form.reset();
            form.style.display = 'block';
          }
          if (successMsg) successMsg.style.display = 'none';
        });

        if (window.__magneticController) {
          window.__magneticController.bindButton(modalBtn);
        }
      }
    };

    // Initial render
    updatePanel(PORTFOLIO_CONFIG.testPrep[0].id);

    // Accessible Keyboard & Click Navigation
    const tabButtons = Array.from(tabsContainer.querySelectorAll('.testprep-tab-btn'));
    tabButtons.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        updatePanel(btn.getAttribute('data-prep-id'));
      });

      btn.addEventListener('keydown', (e) => {
        let newIdx = -1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          newIdx = (idx + 1) % tabButtons.length;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          newIdx = (idx - 1 + tabButtons.length) % tabButtons.length;
        } else if (e.key === 'Home') {
          newIdx = 0;
        } else if (e.key === 'End') {
          newIdx = tabButtons.length - 1;
        }

        if (newIdx !== -1) {
          e.preventDefault();
          tabButtons[newIdx].focus();
          updatePanel(tabButtons[newIdx].getAttribute('data-prep-id'));
        }
      });
    });
  }

  // 7. Accessible Enquiry Dialog Modal
  initEnquiryModal() {
    const modal = document.getElementById('enquiry-modal');
    const openBtns = document.querySelectorAll('[data-open-enquiry]');
    const closeBtn = document.getElementById('modal-close-btn');
    const form = document.getElementById('enquiry-form');
    const successMsg = document.getElementById('modal-success-msg');

    if (!modal) return;

    openBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.showModal();
        if (form) {
          form.reset();
          form.style.display = 'block';
        }
        if (successMsg) successMsg.style.display = 'none';
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => modal.close());
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.close();
    });

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        form.style.display = 'none';
        if (successMsg) successMsg.style.display = 'block';
      });
    }
  }

  // 8. Minimal Custom Cursor (Desktop Only)
  initCustomCursor() {
    if (window.matchMedia('(hover: none) or (pointer: coarse)').matches) return;

    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);

    let mouseX = -100;
    let mouseY = -100;
    let rafPending = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(() => {
          cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
          rafPending = false;
        });
      }
    }, { passive: true });

    const hoverables = 'a, button, [role="button"], input, select, textarea, .language-card, .pillar-card, .institution-card';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverables)) {
        cursor.classList.add('hovering');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverables)) {
        cursor.classList.remove('hovering');
      }
    });
  }
}
