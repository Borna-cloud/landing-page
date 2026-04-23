// Nav scroll effect
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

// Mobile menu
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
navToggle.addEventListener('click', () => mobileMenu.classList.toggle('open'));
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// Fade-up scroll animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// Contact form submission
const form = document.getElementById('bookForm');
const formSuccess = document.getElementById('formSuccess');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const btnArrow = document.getElementById('btnArrow');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const firstName = form.firstName.value.trim();
  const email = form.email.value.trim();
  if (!firstName || !email) {
    const missing = !firstName ? form.firstName : form.email;
    missing.focus();
    missing.style.borderColor = '#e53e3e';
    setTimeout(() => missing.style.borderColor = '', 2200);
    return;
  }
  submitBtn.disabled = true;
  btnText.textContent = 'Sending…';
  btnArrow.style.opacity = '0';
  try {
    const res = await fetch('https://formspree.io/f/xzdyjrzw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        firstName, lastName: form.lastName.value.trim(),
        email, phone: form.phone.value.trim(),
        situation: form.situation.value,
        message: form.message.value.trim(),
        submittedAt: new Date().toISOString(),
      }),
    });
    if (!res.ok) throw new Error('failed');
  } catch (_) {
    submitBtn.disabled = false;
    btnText.textContent = 'Request My Call';
    btnArrow.style.opacity = '1';
    alert('Something went wrong. Please try again or email me directly.');
    return;
  }
  form.hidden = true;
  formSuccess.hidden = false;
});
form.querySelectorAll('input, textarea, select').forEach(el => {
  el.addEventListener('input', () => el.style.borderColor = '');
});

// =============================================
// CALCULATOR UTILITIES
// =============================================

function fmt(n) {
  if (!isFinite(n) || n < 0) return '$—';
  return '$' + Math.round(n).toLocaleString('en-CA');
}

function fmtYrs(months) {
  if (!isFinite(months) || months <= 0) return '—';
  const yrs = Math.floor(months / 12);
  const mos = months % 12;
  if (mos === 0) return yrs + ' yr' + (yrs !== 1 ? 's' : '');
  return yrs + 'y ' + mos + 'm';
}

function mortgagePayment(principal, annualRate, months) {
  const r = annualRate / 100 / 12;
  if (r === 0) return principal / months;
  return principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
}

// =============================================
// ALL-IN-ONE (AYME) CALCULATOR
// =============================================

function runAIO() {
  const price     = parseFloat(document.getElementById('aio-price').value) || 0;
  const down      = parseFloat(document.getElementById('aio-down').value) || 0;
  const rate      = parseFloat(document.getElementById('aio-rate').value) || 0;
  const income    = parseFloat(document.getElementById('aio-income').value) || 0;
  const expenses  = parseFloat(document.getElementById('aio-expenses').value) || 0;
  const amortYrs  = parseInt(document.getElementById('aio-amort').value) || 25;

  document.getElementById('aio-amort-val').textContent = amortYrs;

  const principal = price - down;
  if (principal <= 0 || rate <= 0) return;

  const n = amortYrs * 12;
  const tradPayment = mortgagePayment(principal, rate, n);
  const tradInterest = tradPayment * n - principal;

  document.getElementById('trad-years').textContent = amortYrs + ' yrs';
  document.getElementById('trad-interest').textContent = fmt(tradInterest);
  document.getElementById('trad-payment').textContent = fmt(tradPayment) + '/mo';

  // All-in-one: net cashflow reduces balance each month
  const monthlyRate = rate / 100 / 12;
  const netCashflow = income - expenses;

  if (netCashflow <= 0) {
    document.getElementById('aio-years').textContent = '—';
    document.getElementById('aio-interest').textContent = 'Expenses exceed income';
    document.getElementById('aio-net').textContent = '—';
    document.getElementById('cs-money').textContent = '$—';
    document.getElementById('cs-years').textContent = '—';
    return;
  }

  let balance = principal;
  let totalInterestAIO = 0;
  let monthsAIO = 0;
  const MAX_MONTHS = 600;

  while (balance > 0.01 && monthsAIO < MAX_MONTHS) {
    const interest = balance * monthlyRate;
    const principalPaid = netCashflow - interest;
    if (principalPaid <= 0) {
      // Cash flow covers interest but not enough to reduce principal
      document.getElementById('aio-years').textContent = '50+ yrs';
      document.getElementById('aio-interest').textContent = 'Cash flow too low';
      document.getElementById('aio-net').textContent = fmt(netCashflow) + '/mo';
      document.getElementById('cs-money').textContent = '$—';
      document.getElementById('cs-years').textContent = '—';
      return;
    }
    totalInterestAIO += interest;
    balance -= principalPaid;
    monthsAIO++;
  }

  const savedInterest = tradInterest - totalInterestAIO;
  const savedMonths = n - monthsAIO;

  document.getElementById('aio-years').textContent = fmtYrs(monthsAIO);
  document.getElementById('aio-interest').textContent = fmt(totalInterestAIO);
  document.getElementById('aio-net').textContent = fmt(netCashflow) + '/mo';
  document.getElementById('cs-money').textContent = savedInterest > 0 ? fmt(savedInterest) : '$—';
  document.getElementById('cs-years').textContent = savedMonths > 0 ? fmtYrs(savedMonths) : '—';
}

['aio-price','aio-down','aio-rate','aio-income','aio-expenses'].forEach(id => {
  document.getElementById(id).addEventListener('input', runAIO);
});
document.getElementById('aio-amort').addEventListener('input', runAIO);

// =============================================
// MONTHLY PAYMENT CALCULATOR
// =============================================

function runPayment() {
  const price    = parseFloat(document.getElementById('pay-price').value) || 0;
  const down     = parseFloat(document.getElementById('pay-down').value) || 0;
  const rate     = parseFloat(document.getElementById('pay-rate').value) || 0;
  const amortYrs = parseInt(document.getElementById('pay-amort').value) || 25;

  document.getElementById('pay-amort-val').textContent = amortYrs;

  const principal = price - down;
  if (principal <= 0 || rate <= 0) return;

  const n = amortYrs * 12;
  const payment = mortgagePayment(principal, rate, n);
  const totalInterest = payment * n - principal;

  document.getElementById('pay-result').textContent = fmt(payment) + '/mo';
  document.getElementById('pay-interest').textContent = 'Total interest: ' + fmt(totalInterest);
}

['pay-price','pay-down','pay-rate'].forEach(id => {
  document.getElementById(id).addEventListener('input', runPayment);
});
document.getElementById('pay-amort').addEventListener('input', runPayment);

// =============================================
// AFFORDABILITY CALCULATOR
// =============================================

function runAffordability() {
  const annualIncome  = parseFloat(document.getElementById('aff-income').value) || 0;
  const monthlyDebts  = parseFloat(document.getElementById('aff-debts').value) || 0;
  const downPayment   = parseFloat(document.getElementById('aff-down').value) || 0;
  const rate          = parseFloat(document.getElementById('aff-rate').value) || 0;

  if (annualIncome <= 0 || rate <= 0) return;

  const monthlyIncome = annualIncome / 12;
  // GTA rough estimates for property tax + heating
  const fixedCosts = 600;

  // GDS ≤ 39%, TDS ≤ 44%
  const maxPayGDS = monthlyIncome * 0.39 - fixedCosts;
  const maxPayTDS = monthlyIncome * 0.44 - monthlyDebts - fixedCosts;
  const maxPayment = Math.min(maxPayGDS, maxPayTDS);

  if (maxPayment <= 0) {
    document.getElementById('aff-result').textContent = '$—';
    document.getElementById('aff-mortgage').textContent = 'Income too low or debts too high';
    return;
  }

  // Reverse-calculate principal from max monthly payment (25-yr standard)
  const monthlyRate = rate / 100 / 12;
  const n = 25 * 12;
  const factor = (Math.pow(1 + monthlyRate, n) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, n));
  const maxMortgage = maxPayment * factor;
  const maxHomePrice = maxMortgage + downPayment;

  document.getElementById('aff-result').textContent = fmt(maxHomePrice);
  document.getElementById('aff-mortgage').textContent = 'Max mortgage: ' + fmt(maxMortgage);
}

['aff-income','aff-debts','aff-down','aff-rate'].forEach(id => {
  document.getElementById(id).addEventListener('input', runAffordability);
});

// Run all calculators on load
runAIO();
runPayment();
runAffordability();
