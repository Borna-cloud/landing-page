// Nav scroll effect
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// Reduced motion preference (read once, used everywhere)
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Mobile menu ───────────────────────────────────────────────────────────────
const navToggle  = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');

function closeMobileMenu() {
  mobileMenu.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
}

navToggle.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
  // Move focus into menu when opening
  if (isOpen) {
    const firstLink = mobileMenu.querySelector('a');
    if (firstLink) firstLink.focus();
  }
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMobileMenu);
});

// Escape key closes mobile menu and returns focus to toggle
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
    closeMobileMenu();
    navToggle.focus();
  }
});

// ── Fade-up scroll animations ─────────────────────────────────────────────────
if (prefersReducedMotion) {
  // Skip animation entirely — make everything immediately visible
  document.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
} else {
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));
}

// ── Contact form ──────────────────────────────────────────────────────────────
const form             = document.getElementById('bookForm');
const formSuccess      = document.getElementById('formSuccess');
const submitBtn        = document.getElementById('submitBtn');
const btnText          = document.getElementById('btnText');
const btnArrow         = document.getElementById('btnArrow');
const networkError     = document.getElementById('formNetworkError');
const fullNameInput    = document.getElementById('fullName');
const emailInput       = document.getElementById('email');
const fullNameError    = document.getElementById('fullName-error');
const emailError       = document.getElementById('email-error');

function setFieldError(input, errorEl, message) {
  input.classList.add('invalid');
  errorEl.textContent = message;
  input.setAttribute('aria-invalid', 'true');
}

function clearFieldError(input, errorEl) {
  input.classList.remove('invalid');
  input.style.borderColor = '';
  errorEl.textContent = '';
  input.removeAttribute('aria-invalid');
}

// Clear errors on input
[fullNameInput, emailInput].forEach(input => {
  const errorEl = document.getElementById(`${input.id}-error`);
  input.addEventListener('input', () => clearFieldError(input, errorEl));
});

form.querySelectorAll('input, textarea, select').forEach(el => {
  el.addEventListener('input', () => el.style.borderColor = '');
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  networkError.classList.remove('visible');

  const fullName  = fullNameInput.value.trim();
  const email     = emailInput.value.trim();
  const emailRe   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  let hasError = false;

  if (!fullName) {
    setFieldError(fullNameInput, fullNameError, 'Please enter your full name.');
    hasError = true;
  }
  if (!email || !emailRe.test(email)) {
    setFieldError(emailInput, emailError, 'Please enter a valid email address.');
    hasError = true;
  }

  if (hasError) {
    // Focus the first invalid field
    const firstInvalid = form.querySelector('.invalid');
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  // Loading state
  submitBtn.disabled = true;
  btnText.textContent = 'Sending…';
  btnArrow.style.opacity = '0';

  try {
    const res = await fetch('https://formspree.io/f/xzdyjrzw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        fullName,
        email,
        phone:   form.phone?.value.trim()   || '',
        message: form.message?.value.trim() || '',
        submittedAt: new Date().toISOString(),
      }),
    });
    if (!res.ok) throw new Error('failed');
  } catch (_) {
    submitBtn.disabled = false;
    btnText.textContent = 'Show me my number';
    btnArrow.style.opacity = '1';
    networkError.classList.add('visible');
    return;
  }

  // Success
  form.hidden = true;
  formSuccess.hidden = false;
  formSuccess.focus();
});

// ── Number count-up on scroll ─────────────────────────────────────────────────
function animateCount(el) {
  const target = parseFloat(el.dataset.target);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';

  // Respect reduced motion — just show the final number instantly
  if (prefersReducedMotion) {
    const val = target < 100 ? Math.floor(target) : Math.round(target);
    el.textContent = prefix + val.toLocaleString() + suffix;
    return;
  }

  const duration = 1800;
  const start    = performance.now();

  function update(t) {
    const p     = Math.min((t - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const val   = target < 100 ? Math.floor(eased * target) : Math.round(eased * target);
    el.textContent = prefix + val.toLocaleString() + suffix;
    if (p < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const countObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCount(e.target);
      countObs.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.count-up').forEach(el => countObs.observe(el));

// ── FAQ accordion (event delegation — handles both inline + sheet) ────────────
document.addEventListener('click', function(e) {
  const btn = e.target.closest('.faq-q');
  if (!btn) return;

  const answerId = btn.getAttribute('aria-controls');
  const answer   = answerId ? document.getElementById(answerId) : btn.nextElementSibling;
  const isOpen   = btn.getAttribute('aria-expanded') === 'true';

  // Close all siblings within the same list
  const root = btn.closest('ul, .faq-inner') || document;
  root.querySelectorAll('.faq-q').forEach(b => {
    b.setAttribute('aria-expanded', 'false');
    b.parentElement.removeAttribute('open');
    const id  = b.getAttribute('aria-controls');
    const ans = id ? document.getElementById(id) : b.nextElementSibling;
    if (ans) ans.style.display = 'none';
  });

  if (!isOpen) {
    btn.setAttribute('aria-expanded', 'true');
    btn.parentElement.setAttribute('open', '');
    if (answer) answer.style.display = 'block';
  }
});

// ── FAQ bottom sheet ──────────────────────────────────────────────────────────
const faqSheet    = document.getElementById('faqSheet');
const faqBackdrop = document.getElementById('faqBackdrop');
const faqClose    = document.getElementById('faqSheetClose');

function openFaqSheet() {
  faqSheet.classList.add('open');
  faqBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
  faqClose.focus();
}
function closeFaqSheet() {
  faqSheet.classList.remove('open');
  faqBackdrop.classList.remove('open');
  document.body.style.overflow = '';
}

document.querySelectorAll('[data-faq-trigger]').forEach(link => {
  link.addEventListener('click', e => {
    if (window.innerWidth <= 640) {
      e.preventDefault();
      closeMobileMenu();
      openFaqSheet();
    }
  });
});

faqBackdrop.addEventListener('click', closeFaqSheet);
faqClose.addEventListener('click', closeFaqSheet);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && faqSheet.classList.contains('open')) closeFaqSheet();
});

// ── HIW carousel dots ─────────────────────────────────────────────────────────
const hiwCards = document.querySelector('.hiw-cards');
const hiwDots  = document.querySelectorAll('.hiw-dot');

if (hiwCards && hiwDots.length) {
  hiwCards.addEventListener('scroll', () => {
    const idx = Math.round(hiwCards.scrollLeft / hiwCards.offsetWidth);
    hiwDots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }, { passive: true });

  hiwDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.slide, 10);
      hiwCards.scrollTo({ left: idx * hiwCards.offsetWidth, behavior: 'smooth' });
    });
  });
}

// ── Show sticky CTA after hero scrolls out ────────────────────────────────────
const stickyCta = document.getElementById('stickyCta');
const hero      = document.querySelector('.hero');
const heroObs   = new IntersectionObserver(entries => {
  stickyCta.classList.toggle('visible', !entries[0].isIntersecting);
}, { threshold: 0 });
if (hero) heroObs.observe(hero);

// ── Hero house drag-to-rotate ─────────────────────────────────────────────────
(function () {
  const el = document.getElementById('heroHouse');
  if (!el || prefersReducedMotion) return;

  let dragging = false;
  let startX = 0, startY = 0;
  let rotY = 0, rotX = 0;
  const PERSP = 700;

  function setTransform() {
    el.style.transform = `perspective(${PERSP}px) rotateY(${rotY}deg) rotateX(${rotX}deg)`;
  }

  function onStart(x, y) {
    dragging = true;
    startX = x; startY = y;
    el.classList.add('is-dragging');
    el.style.transition = 'none';
  }

  function onMove(x, y) {
    if (!dragging) return;
    rotY += (x - startX) * 0.45;
    rotX -= (y - startY) * 0.28;
    rotX = Math.max(-40, Math.min(40, rotX));
    startX = x; startY = y;
    setTransform();
  }

  function onEnd() {
    if (!dragging) return;
    dragging = false;
    el.classList.remove('is-dragging');
    el.style.transition = 'transform 0.75s cubic-bezier(0.34, 1.56, 0.64, 1)';
    rotY = 0; rotX = 0;
    setTransform();
    setTimeout(() => { el.style.transition = ''; }, 750);
  }

  el.addEventListener('mousedown', e => { onStart(e.clientX, e.clientY); e.preventDefault(); });
  document.addEventListener('mousemove', e => onMove(e.clientX, e.clientY));
  document.addEventListener('mouseup', onEnd);

  el.addEventListener('touchstart', e => {
    const t = e.touches[0];
    onStart(t.clientX, t.clientY);
  }, { passive: true });
  el.addEventListener('touchmove', e => {
    const t = e.touches[0];
    onMove(t.clientX, t.clientY);
  }, { passive: true });
  el.addEventListener('touchend', onEnd);
}());
