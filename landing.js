// ====================== GeniusCFO Landing — interactions ======================
(function () {
  'use strict';

  // ---------- GTM placeholder (graceful no-op if GTM missing) ----------
  window.dataLayer = window.dataLayer || [];
  function track(event, params) {
    try { window.dataLayer.push(Object.assign({ event }, params || {})); } catch (e) {}
  }

  // ---------- Mark JS-ready (enables reveal animations) ----------
  // Hold until first paint, then enable hiding so we don't FOUC content.
  requestAnimationFrame(() => {
    document.documentElement.classList.add('js-ready');
    // Immediately reveal anything already in view so above-the-fold isn't held hostage
    requestAnimationFrame(() => {
      document.querySelectorAll('.reveal, .reveal-stagger').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) {
          el.classList.add('is-visible');
        }
      });
    });
  });

  // ---------- Nav scroll state ----------
  const nav = document.getElementById('nav');
  function onScroll() {
    if (window.scrollY > 50) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Scroll reveal ----------
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal, .reveal-stagger').forEach((el) => io.observe(el));

  // ---------- Counter animation ----------
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const dur = 1200;
      const t0 = performance.now();
      function step(t) {
        const k = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (k < 1) requestAnimationFrame(step);
        else el.textContent = target + suffix;
      }
      requestAnimationFrame(step);
      countIO.unobserve(el);
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('[data-count]').forEach((el) => countIO.observe(el));

  // ---------- Scroll depth ----------
  const milestones = [25, 50, 75, 100];
  const seen = new Set();
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const pct = Math.round(((h.scrollTop + window.innerHeight) / h.scrollHeight) * 100);
    milestones.forEach((m) => {
      if (pct >= m && !seen.has(m)) {
        seen.add(m);
        track('scroll_depth', { depth: m });
      }
    });
  }, { passive: true });

  // ---------- CTA click tracking ----------
  document.querySelectorAll('[data-cta]').forEach((btn) => {
    btn.addEventListener('click', () => {
      track('cta_click', { label: btn.dataset.cta, text: btn.textContent.trim().slice(0, 60), href: btn.getAttribute('href') || '' });
    });
  });

  // ---------- FAQ accordion (one open at a time) ----------
  const faqs = document.querySelectorAll('.faq-item');
  faqs.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        item.classList.add('open');
        faqs.forEach((other) => {
          if (other !== item && other.open) {
            other.open = false;
            other.classList.remove('open');
          }
        });
      } else {
        item.classList.remove('open');
      }
    });
  });

  // ---------- Demo modal ----------
  const demoModal = document.getElementById('demo-modal');
  const demoIframe = document.getElementById('demo-iframe');
  const YT_URL = 'https://www.youtube.com/embed/vt3HkHW_akg?autoplay=1&rel=0';
  document.querySelectorAll('[data-watch-demo]').forEach((btn) => {
    btn.addEventListener('click', () => {
      demoIframe.src = YT_URL;
      demoModal.classList.add('open');
      document.body.style.overflow = 'hidden';
      track('cta_click', { label: 'watch_demo' });
    });
  });

  // ---------- Legal modals ----------
  const legalModal = document.getElementById('legal-modal');
  const legalEyebrow = document.getElementById('legal-eyebrow');
  const legalTitle = document.getElementById('legal-title');
  const legalBody = document.getElementById('legal-body');

  const LEGAL = {
    privacy: {
      eyebrow: 'Last updated · May 2026',
      title: 'Privacy Policy',
      html: `
        <p>This summary describes how GeniusCFO Technologies Pvt. Ltd. handles personal data. The full text is published at <a href="#">geniuscfo.ai/legal/privacy</a>.</p>
        <h3>What we collect</h3>
        <p>Account info (name, email, phone, business name), financial data you connect via Account Aggregator or upload, and product usage metrics. We do not collect anything we do not need to run the service.</p>
        <h3>How we use it</h3>
        <p>To run your books, prepare your filings, generate forecasts and alerts, and improve the product. We do not sell data. We do not use it to train models that are shared across customers without explicit, opt-in consent.</p>
        <h3>Where it lives</h3>
        <p>Customer data is stored within India in compliance with the Digital Personal Data Protection Act, 2023. Encrypted at rest (AES-256) and in transit (TLS 1.3).</p>
        <h3>Your rights</h3>
        <p>Access, correct, export, or delete your data at any time from Settings or by emailing <a href="mailto:privacy@geniuscfo.ai">privacy@geniuscfo.ai</a>. We respond within 30 days.</p>`,
    },
    terms: {
      eyebrow: 'Last updated · May 2026',
      title: 'Terms of Service',
      html: `
        <p>By signing up to the waitlist or using GeniusCFO, you agree to the following. The complete agreement is at <a href="#">geniuscfo.ai/legal/terms</a>.</p>
        <h3>The service</h3>
        <p>GeniusCFO is an accounting and financial intelligence platform. Filings prepared by the system require a chartered accountant or authorised signatory sign-off where mandated by law.</p>
        <h3>Pricing</h3>
        <p>Beta waitlist participants who enrol within 60 days of beta open get founding-member pricing of ₹9,999 per year, locked in for as long as the subscription remains active and continuous.</p>
        <h3>Liability</h3>
        <p>The system provides recommendations. Final financial decisions are yours. Standard limitation of liability applies as per Indian Contract Act, 1872.</p>`,
    },
    cookie: {
      eyebrow: 'Last updated · May 2026',
      title: 'Cookie Policy',
      html: `
        <p>We use essential cookies for authentication and session management, and analytics cookies (Google Analytics, behavioural) to understand how the product is used.</p>
        <h3>Categories</h3>
        <p><strong>Strictly necessary:</strong> session, CSRF, security. Cannot be turned off.<br><strong>Analytics:</strong> aggregated usage. Off by default until you opt in via the cookie banner.</p>`,
    },
    disclaimer: {
      eyebrow: 'For information only',
      title: 'Disclaimer',
      html: `
        <p>Forecasts, alerts, and advisory outputs from GeniusCFO are estimates based on the data the system has access to. They are not a substitute for the judgement of a qualified chartered accountant, tax adviser, or company secretary.</p>
        <p>Comparison data with other products is sourced from public pricing and feature pages as of May 2026. Competitors may have updated their offerings since.</p>`,
    },
    dpa: {
      eyebrow: 'For B2B customers',
      title: 'Data Processing Addendum',
      html: `
        <p>When you use GeniusCFO to process data of your customers, employees, or vendors, you are the controller and we are the processor. The DPA covers sub-processors, security measures, breach notification, and audit rights.</p>
        <p>Request a signed DPA at <a href="mailto:legal@geniuscfo.ai">legal@geniuscfo.ai</a>.</p>`,
    },
  };

  document.querySelectorAll('[data-modal]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const key = a.dataset.modal;
      const data = LEGAL[key];
      if (!data) return;
      legalEyebrow.textContent = data.eyebrow;
      legalTitle.textContent = data.title;
      legalBody.innerHTML = data.html;
      legalModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  document.querySelectorAll('[data-modal-close]').forEach((b) => {
    b.addEventListener('click', () => closeModals());
  });
  [demoModal, legalModal].forEach((m) => {
    m.addEventListener('click', (e) => { if (e.target === m) closeModals(); });
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModals(); });
  function closeModals() {
    demoModal.classList.remove('open');
    legalModal.classList.remove('open');
    demoIframe.src = '';
    document.body.style.overflow = '';
  }

  // ---------- Waitlist form ----------
  const form = document.getElementById('waitlist-form');
  const success = document.getElementById('waitlist-success');
  const ENDPOINT = 'https://script.google.com/macros/s/AKfycby2kVnqAkcFj93_kSpzUHwWzEXyysxlsxhLW7WymcU1_CcvadwLrLeWqVfbyA54QM6grA/exec';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    data.timestamp = new Date().toISOString();

    track('generate_lead', { turnover: data.turnover, role: data.role });

    try {
      await fetch(ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (err) { /* no-cors returns opaque — ignore */ }

    form.style.display = 'none';
    document.querySelector('.waitlist-count').style.display = 'none';
    success.style.display = 'block';
  });

  // ---------- Smooth nav scroll offset ----------
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href === '#' || href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 56;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
