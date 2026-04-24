// ── Mobile Nav ──────────────────────────────────────────────
const mobileNav      = document.getElementById('mobileNav');
const mobileOverlay  = document.getElementById('mobileNavOverlay');
const menuToggle     = document.querySelector('.mobile-menu-toggle');
const navClose       = document.querySelector('.mobile-nav-close');

function openMobileNav() {
  mobileNav.classList.add('open');
  mobileOverlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeMobileNav() {
  mobileNav.classList.remove('open');
  mobileOverlay.classList.remove('show');
  document.body.style.overflow = '';
}

menuToggle?.addEventListener('click', openMobileNav);
navClose?.addEventListener('click', closeMobileNav);
mobileOverlay?.addEventListener('click', closeMobileNav);

// ── Search Drawer ─────────────────────────────────────────────
const searchDrawer  = document.getElementById('searchDrawer');
const searchToggle  = document.querySelector('.search-toggle');
const searchClose   = document.querySelector('.search-close');

searchToggle?.addEventListener('click', () => {
  searchDrawer.classList.toggle('open');
  if (searchDrawer.classList.contains('open')) {
    searchDrawer.querySelector('input').focus();
  }
});
searchClose?.addEventListener('click', () => {
  searchDrawer.classList.remove('open');
});

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeMobileNav();
    searchDrawer?.classList.remove('open');
  }
});

// ── Quick Add – prevent submitting without size ───────────────
document.querySelectorAll('.quick-add-form').forEach(form => {
  form.addEventListener('submit', (e) => {
    const sizeSelect = form.querySelector('select[name="size"]');
    if (sizeSelect && !sizeSelect.value) {
      e.preventDefault();
      sizeSelect.style.border = '1.5px solid #c0392b';
      setTimeout(() => sizeSelect.style.border = '', 2000);
    }
  });
});

// ── Sticky header shrink on scroll ───────────────────────────
const header = document.querySelector('.site-header');
let lastScrollY = 0;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (y > 60) header?.classList.add('scrolled');
  else header?.classList.remove('scrolled');
  lastScrollY = y;
}, { passive: true });

// ── Newsletter ────────────────────────────────────────────────
document.querySelectorAll('.newsletter-form').forEach(form => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    if (input && input.value) {
      const btn = form.querySelector('button');
      btn.textContent = '✓ Subscribed!';
      input.value = '';
      setTimeout(() => btn.textContent = 'Subscribe', 3000);
    }
  });
});

// ── Scroll Reveal (IntersectionObserver) ─────────────────────
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion && 'IntersectionObserver' in window) {
  const revealEls = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));

  // Stagger-reveal product cards within each grid
  document.querySelectorAll('.product-grid').forEach(grid => {
    const cards = grid.querySelectorAll('.product-card');
    cards.forEach((c, i) => {
      c.style.opacity = '0';
      c.style.transform = 'translateY(30px)';
      c.style.transition = `opacity .7s cubic-bezier(.22,1,.36,1) ${i * 70}ms, transform .7s cubic-bezier(.22,1,.36,1) ${i * 70}ms, box-shadow .5s cubic-bezier(.22,1,.36,1), border-color .4s cubic-bezier(.22,1,.36,1)`;
    });
  });
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'none';
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('.product-card').forEach(c => cardObserver.observe(c));
}

// ── Magnetic Buttons ─────────────────────────────────────────
if (!prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.btn-magnetic').forEach(btn => {
    const strength = 18;
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${(x / rect.width) * strength}px, ${(y / rect.height) * strength}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

// ── Parallax Hero ────────────────────────────────────────────
if (!prefersReducedMotion) {
  const heroContent = document.querySelector('.hero-content');
  const heroVideo   = document.querySelector('.hero-video-el');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      if (heroContent) heroContent.style.transform = `translateY(${y * 0.25}px)`;
      if (heroContent) heroContent.style.opacity = String(Math.max(0, 1 - y / 500));
      if (heroVideo)   heroVideo.style.transform = `scale(${1.02 + y * 0.0003}) translateY(${y * 0.08}px)`;
    }
  }, { passive: true });
}

// ── Product Card tilt (subtle) ───────────────────────────────
if (!prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.product-card').forEach(card => {
    const img = card.querySelector('.product-card-img-wrap img');
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-8px) perspective(900px) rotateX(${-y * 3}deg) rotateY(${x * 3}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ── Ensure hero video autoplays on mobile Safari ─────────────
document.addEventListener('DOMContentLoaded', () => {
  const vid = document.querySelector('.hero-video-el');
  if (vid) {
    vid.muted = true;
    const tryPlay = () => vid.play().catch(() => {});
    tryPlay();
    document.addEventListener('touchstart', tryPlay, { once: true, passive: true });
  }
});
