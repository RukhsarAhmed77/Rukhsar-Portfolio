// ============================================
// PRELOADER
// ============================================
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  setTimeout(() => {
    preloader.classList.add('hidden');
    initAnimations();
  }, 1500);
});

// ============================================
// PARTICLE SYSTEM
// ============================================
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let mouseX = 0;
let mouseY = 0;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 1.5 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.speedY = (Math.random() - 0.5) * 0.3;
    this.opacity = Math.random() * 0.5 + 0.1;
    this.life = Math.random() * 200 + 100;
    this.maxLife = this.life;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life--;

    // Mouse repulsion
    const dx = this.x - mouseX;
    const dy = this.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 120) {
      const force = (120 - dist) / 120;
      this.x += (dx / dist) * force * 2;
      this.y += (dy / dist) * force * 2;
    }

    if (this.life <= 0 || this.x < 0 || this.x > canvas.width ||
        this.y < 0 || this.y > canvas.height) {
      this.reset();
    }
  }

  draw() {
    const alpha = (this.life / this.maxLife) * this.opacity;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 241, 254, ${alpha})`;
    ctx.fill();
  }
}

// Create particles
for (let i = 0; i < 80; i++) {
  particles.push(new Particle());
}

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 150) {
        const alpha = (1 - dist / 150) * 0.08;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(0, 241, 254, ${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  drawConnections();
  requestAnimationFrame(animateParticles);
}

animateParticles();

// ============================================
// CURSOR GLOW
// ============================================
const cursorGlow = document.getElementById('cursorGlow');

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorGlow.style.left = e.clientX + 'px';
  cursorGlow.style.top = e.clientY + 'px';

  // Update CSS variables for card hover effects
  document.querySelectorAll('.pricing-card, .testimonial-card').forEach(card => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
    card.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
  });
});

// ============================================
// NAVBAR
// ============================================
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);

  // Back to top visibility
  const backToTop = document.getElementById('backToTop');
  backToTop.classList.toggle('visible', window.scrollY > 600);

  // Active nav link
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop - 200;
    if (window.scrollY >= top) current = section.getAttribute('id');
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
});

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

// Back to top
document.getElementById('backToTop').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ============================================
// GSAP SCROLL ANIMATIONS
// ============================================
function initAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  // IntersectionObserver for reliable [data-animate] reveals
  // (avoids GSAP timing conflicts and works even without scrolling)
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseFloat(el.dataset.delay) || 0;
        setTimeout(() => el.classList.add('revealed'), delay * 1000);
        revealObserver.unobserve(el);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('[data-animate]').forEach(el => revealObserver.observe(el));

  // Parallax hero elements only (GSAP used for scrub effects, not opacity)
  gsap.to('.hero-radial-glow', {
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1
    },
    y: 200,
    opacity: 0
  });

  gsap.to('.hero-bg-grid', {
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1
    },
    y: 100,
    opacity: 0
  });

  // Skill tags stagger — use IntersectionObserver to avoid ScrollTrigger timing issues
  const skillTagObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const tags = entry.target.querySelectorAll('.skill-tag');
        tags.forEach((tag, i) => {
          setTimeout(() => {
            tag.style.opacity = '1';
            tag.style.transform = 'scale(1)';
          }, i * 60);
        });
        skillTagObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  const skillTagsEl = document.querySelector('.skill-tags');
  if (skillTagsEl) skillTagObserver.observe(skillTagsEl);

  // Stat counter animation
  const statNumbers = document.querySelectorAll('.stat-number[data-count]');
  statNumbers.forEach(num => {
    const target = parseInt(num.dataset.count);
    ScrollTrigger.create({
      trigger: num,
      start: 'top 90%',
      onEnter: () => animateCounter(num, target)
    });
  });
}

function animateCounter(element, target) {
  let current = 0;
  const duration = 2000;
  const step = target / (duration / 16);

  function update() {
    current += step;
    if (current >= target) {
      element.textContent = target;
      return;
    }
    element.textContent = Math.floor(current);
    requestAnimationFrame(update);
  }
  update();
}

// ============================================
// TERMINAL TYPING EFFECT
// ============================================
const terminalCommands = [
  {
    cmd: 'rukhsar --info',
    output: `{
  "role": "Full Stack Developer",
  "specialization": "Shopify Stores & MERN Apps",
  "status": "Ready to build next-gen solutions"
}`
  },
  {
    cmd: 'rukhsar --skills',
    output: `[
  "React.js", "Node.js", "MongoDB",
  "Express.js", "Shopify", "Next.js",
  "TypeScript", "Tailwind CSS"
]`
  },
  {
    cmd: 'rukhsar --contact',
    output: `{
  "email": "rukhsar@developer.io",
  "github": "github.com/rukhsar",
  "available": true
}`
  }
];

let cmdIndex = 0;
const typedCommand = document.getElementById('typedCommand');
const terminalOutput = document.getElementById('terminalOutput');
let isTyping = false;

function typeCommand() {
  if (isTyping) return;
  isTyping = true;

  const { cmd, output } = terminalCommands[cmdIndex];
  let charIndex = 0;
  typedCommand.textContent = '';
  terminalOutput.textContent = '';

  function typeChar() {
    if (charIndex < cmd.length) {
      typedCommand.textContent += cmd[charIndex];
      charIndex++;
      setTimeout(typeChar, 50 + Math.random() * 80);
    } else {
      setTimeout(() => {
        typeOutput(output);
      }, 300);
    }
  }

  function typeOutput(text) {
    let outIndex = 0;
    function typeOutChar() {
      if (outIndex < text.length) {
        terminalOutput.textContent += text[outIndex];
        outIndex++;
        setTimeout(typeOutChar, 15);
      } else {
        isTyping = false;
        cmdIndex = (cmdIndex + 1) % terminalCommands.length;
        setTimeout(typeCommand, 3000);
      }
    }
    typeOutChar();
  }

  typeChar();
}

// Start typing when terminal is visible
const terminalObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !isTyping) {
      typeCommand();
      terminalObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const terminalEl = document.querySelector('.terminal');
if (terminalEl) terminalObserver.observe(terminalEl);

// ============================================
// TESTIMONIALS CAROUSEL
// ============================================
const track = document.getElementById('testimonialsTrack');
const cards = document.querySelectorAll('.testimonial-card');
const prevBtn = document.getElementById('prevTestimonial');
const nextBtn = document.getElementById('nextTestimonial');
let currentSlide = 0;

if (window.innerWidth <= 1024 && cards.length > 1) {
  prevBtn.addEventListener('click', () => {
    currentSlide = Math.max(0, currentSlide - 1);
    updateCarousel();
  });

  nextBtn.addEventListener('click', () => {
    currentSlide = Math.min(cards.length - 1, currentSlide + 1);
    updateCarousel();
  });
}

function updateCarousel() {
  if (window.innerWidth <= 1024) {
    const cardWidth = cards[0].offsetWidth + 32;
    track.style.transform = `translateX(-${currentSlide * cardWidth}px)`;
  }
}

// ============================================
// CONTACT FORM
// ============================================
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const btn = contactForm.querySelector('button[type="submit"]');
  btn.innerHTML = '<span>Sending...</span> <i class="fas fa-spinner fa-spin"></i>';
  btn.disabled = true;

  setTimeout(() => {
    contactForm.style.display = 'none';
    formSuccess.classList.add('visible');
  }, 1500);
});

// Input focus glow animation
document.querySelectorAll('.form-input').forEach(input => {
  input.addEventListener('focus', () => {
    input.parentElement.classList.add('focused');
  });
  input.addEventListener('blur', () => {
    input.parentElement.classList.remove('focused');
  });
});

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      const offset = navbar.offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ============================================
// TILT EFFECT ON HERO CARD
// ============================================
const heroCard = document.querySelector('.hero-card');
if (heroCard) {
  heroCard.addEventListener('mousemove', (e) => {
    const rect = heroCard.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    heroCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  heroCard.addEventListener('mouseleave', () => {
    heroCard.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    heroCard.style.transition = 'transform 0.5s ease';
  });

  heroCard.addEventListener('mouseenter', () => {
    heroCard.style.transition = 'none';
  });
}

// ============================================
// MAGNETIC BUTTON EFFECT
// ============================================
document.querySelectorAll('.btn-primary, .nav-cta').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});
