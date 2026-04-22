// Nav scroll effect
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

// Mobile menu toggle
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
navToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// Scroll fade-up animations
const animEls = document.querySelectorAll('.step-card, .about-feature, .trust-item, .form-card, .agent-card');
animEls.forEach(el => el.classList.add('fade-up'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// Form submission
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

  const data = {
    firstName,
    lastName: form.lastName.value.trim(),
    email,
    phone: form.phone.value.trim(),
    situation: form.situation.value,
    message: form.message.value.trim(),
    submittedAt: new Date().toISOString(),
  };

  try {
    const res = await fetch('https://formspree.io/f/xzdyjrzw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data),
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

// Photo swap: if borna-photo.jpg exists, show it
['agentPhoto', 'aboutPhoto'].forEach(id => {
  const img = document.getElementById(id);
  if (!img) return;
  img.src = 'borna-photo.jpg';
  img.onload = () => {
    img.style.display = 'block';
    const placeholder = document.getElementById(id === 'agentPhoto' ? 'agentPhotoPlaceholder' : 'aboutPhotoPlaceholder');
    if (placeholder) placeholder.style.display = 'none';
  };
});
