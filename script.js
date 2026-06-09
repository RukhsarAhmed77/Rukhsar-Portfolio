// ============================================
// HERO TITLE — line-by-line entrance on load
// ============================================
window.addEventListener('load', () => {
  // Tiny delay ensures fonts are painted
  requestAnimationFrame(() => {
    document.getElementById('heroTitle').classList.add('ready');
  });
});

// ============================================
// CUSTOM CURSOR — lerp-following circle
// ============================================
const cursor    = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

if (!isTouchDevice) {
  let mx = -200, my = -200;  // mouse
  let cx = -200, cy = -200;  // cursor (lerped)

  const lerp = (a, b, t) => a + (b - a) * t;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    // Dot snaps immediately
    cursorDot.style.transform = `translate(${mx - 3}px, ${my - 3}px)`;
  });

  (function animCursor() {
    cx = lerp(cx, mx, 0.1);
    cy = lerp(cy, my, 0.1);
    cursor.style.transform = `translate(${cx - 23}px, ${cy - 23}px)`;
    requestAnimationFrame(animCursor);
  })();

  // Grow cursor + show label on interactive elements
  document.querySelectorAll('.work-item').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.dataset.label = 'VIEW';
      cursor.classList.add('big');
    });
    el.addEventListener('mouseleave', () => {
      cursor.dataset.label = '';
      cursor.classList.remove('big');
    });
  });

  document.querySelectorAll('a:not(.work-links a), button, .btn').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('big'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('big'));
  });
}

// ============================================
// NAV — background on scroll + mobile menu
// ============================================
const nav       = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('open');
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => {
    navToggle.classList.remove('open');
    navLinks.classList.remove('open');
  })
);

// ============================================
// SCROLL REVEAL — .reveal elements
// ============================================
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// ============================================
// SECTION TITLE REVEAL — clip-up on scroll
// ============================================
const titleObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      titleObs.unobserve(e.target);
    }
  });
}, { threshold: 0.25 });

document.querySelectorAll('.section-title').forEach(el => titleObs.observe(el));

// ============================================
// STAT NUMBER SCRAMBLE
// ============================================
const statObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el     = e.target;
    const target = parseInt(el.dataset.count, 10);
    const dur    = 1600;
    const settle = dur * 0.60;
    const start  = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const p = Math.min(elapsed / dur, 1);
      if (p < 1) {
        if (elapsed < settle) {
          el.textContent = Math.floor(Math.random() * 90 + 10);
        } else {
          const sp = (elapsed - settle) / (dur - settle);
          el.textContent = Math.round(sp * target);
        }
        requestAnimationFrame(tick);
      } else {
        el.textContent = target;
      }
    };
    requestAnimationFrame(tick);
    statObs.unobserve(el);
  });
}, { threshold: 0.7 });

document.querySelectorAll('.hero-stats dt[data-count]').forEach(el => statObs.observe(el));

// ============================================
// CONTACT FORM
// ============================================
const form     = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = 'Sending...';
  btn.disabled = true;

  setTimeout(() => {
    form.querySelectorAll('.field').forEach(f => f.style.display = 'none');
    btn.style.display = 'none';
    formNote.hidden = false;
  }, 1000);
});
