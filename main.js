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
const hero      = document.querySelector('.g-hero-split');
const heroObs   = new IntersectionObserver(entries => {
  stickyCta.classList.toggle('visible', !entries[0].isIntersecting);
}, { threshold: 0 });
if (hero) heroObs.observe(hero);

// Deduplicate FAQ: populate mobile sheet from main list (edit only once)
(function populateMobileFaq() {
  const mainList = document.getElementById('faqMainList');
  const sheetList = document.getElementById('faqSheetList');
  if (mainList && sheetList) {
    const clone = mainList.cloneNode(true);
    // Assign unique ids/aria to cloned answers so getElementById works correctly
    clone.querySelectorAll('.faq-a').forEach((div, i) => {
      const newId = 'sfaq-a-' + (i + 1);
      div.id = newId;
    });
    clone.querySelectorAll('.faq-q').forEach((btn, i) => {
      btn.setAttribute('aria-controls', 'sfaq-a-' + (i + 1));
    });
    sheetList.innerHTML = clone.innerHTML;
  }
})();

// ── AYME Chart ───────────────────────────────────────────────────────────────
(function() {
  var tradBal = [750000,737811,725068,711745,697816,683252,668026,652107,635464,618063,599871,580850,560964,540174,518437,495710,471950,447108,421136,393982,365593,335911,304879,272435,238514,203050,165971,127206,86676,44302,0];
  var aymeBal = [750000,705953,659213,609614,556983,501133,441868,378979,312245,241429,166283,86542,1925,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  var labels = [];
  for (var i = 0; i <= 30; i++) { labels.push(String(i)); }

  var gridColor  = 'rgba(0,0,0,0.05)';
  var tickColor  = 'rgba(0,0,0,0.4)';
  var titleColor = 'rgba(0,0,0,0.55)';

  var ctx = document.getElementById('aymeChart');
  var chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Traditional 4.50%',
          data: new Array(31).fill(null),
          borderColor: 'rgba(150,158,172,0.65)',
          backgroundColor: 'rgba(176,184,196,0.10)',
          fill: true, tension: 0.35, cubicInterpolationMode: 'monotone', pointRadius: 0, borderWidth: 2
        },
        {
          label: 'AYME 5.95%',
          data: new Array(31).fill(null),
          borderColor: '#F47920',
          backgroundColor: 'rgba(244,121,32,0.09)',
          fill: true, tension: 0.35, cubicInterpolationMode: 'monotone', pointRadius: 0, borderWidth: 2.5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 0 },
      layout: { padding: { left: 12 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#fff',
          borderColor: 'rgba(0,0,0,0.08)',
          borderWidth: 1,
          titleColor: '#111827',
          bodyColor: '#6B7280',
          padding: 10,
          animation: { duration: 80 },
          callbacks: {
            label: function(c) {
              if (c.parsed.y === null || c.parsed.y === 0) return c.dataset.label + ': Paid off';
              return c.dataset.label + ': $' + Math.round(c.parsed.y).toLocaleString();
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true, max: 800000,
          grid: { color: gridColor },
          ticks: { color: tickColor, font: { size: 11, family: "'DM Sans', sans-serif" }, callback: function(v) { return v === 0 ? '$0' : '$' + Math.round(v/1000) + 'K'; } },
          title: { display: true, text: 'Balance owing', color: titleColor, font: { size: 12, family: "'DM Sans', sans-serif", weight: '600' } }
        },
        x: {
          grid: { display: false },
          ticks: { color: tickColor, font: { size: 11, family: "'DM Sans', sans-serif" }, maxRotation: 0 },
          title: { display: true, text: 'Years', color: titleColor, font: { size: 12, family: "'DM Sans', sans-serif", weight: '600' } }
        }
      },
      interaction: { intersect: false, mode: 'index' }
    }
  });

  chart.data.datasets[0].data = tradBal.slice();
  chart.data.datasets[1].data = aymeBal.slice();

  var clipProgress = 0;
  var clipPlugin = {
    id: 'clipReveal',
    beforeDatasetsDraw: function(ch) {
      var area = ch.chartArea;
      var ctx2 = ch.ctx;
      var revealX = area.left + (area.right - area.left) * clipProgress;
      ctx2.save();
      ctx2.beginPath();
      ctx2.rect(area.left, area.top - 10, revealX - area.left, area.bottom - area.top + 20);
      ctx2.clip();
    },
    afterDatasetsDraw: function(ch) { ch.ctx.restore(); }
  };
  Chart.register(clipPlugin);
  chart.update('none');

  var DURATION = 2200;
  var startTime = null;
  function easeInOutCubic(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }
  function drawFrame(ts) {
    if (!startTime) startTime = ts;
    var elapsed = ts - startTime;
    var progress = Math.min(elapsed / DURATION, 1);
    clipProgress = easeInOutCubic(progress);
    chart.draw();
    if (progress < 1) {
      requestAnimationFrame(drawFrame);
    } else {
      clipProgress = 1; chart.draw();
      setTimeout(function() {
        var results = document.getElementById('aymeRes');
        if (results) results.classList.add('show');
      }, 200);
    }
  }

  var triggered = false;
  function checkScroll() {
    if (triggered) return;
    var el = document.querySelector('.ayme-chart-section');
    if (!el) return;
    var rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85) {
      triggered = true;
      if (prefersReducedMotion) {
        // Skip animation — reveal chart immediately
        clipProgress = 1; chart.draw();
        setTimeout(function() {
          var results = document.getElementById('aymeRes');
          if (results) results.classList.add('show');
        }, 0);
      } else {
        setTimeout(function() { requestAnimationFrame(drawFrame); }, 300);
      }
    }
  }
  window.addEventListener('scroll', checkScroll, { passive: true });
  checkScroll();
})();
