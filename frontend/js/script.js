// ── CAROUSEL HERO ──
const heroTrack = document.getElementById('heroTrack');
const heroDots  = document.querySelectorAll('.carousel-dot');
let heroCurrentIndex = 0;
const heroTotalSlides = 3;

function heroGoTo(n) {
  if (!heroTrack) return;
  heroCurrentIndex = (n + heroTotalSlides) % heroTotalSlides;
  heroTrack.style.transform = `translateX(-${heroCurrentIndex * 100}%)`;
  heroDots.forEach((d, i) => {
    d.classList.toggle('active', i === heroCurrentIndex);
    d.setAttribute('aria-selected', i === heroCurrentIndex);
  });
}

if (heroTrack) {
  const heroPrev = document.getElementById('heroPrev');
  const heroNext = document.getElementById('heroNext');

  if (heroPrev) heroPrev.addEventListener('click', () => heroGoTo(heroCurrentIndex - 1));
  if (heroNext) heroNext.addEventListener('click', () => heroGoTo(heroCurrentIndex + 1));
  heroDots.forEach(d => d.addEventListener('click', () => heroGoTo(+d.dataset.index)));

  const heroAutoplay = setInterval(() => heroGoTo(heroCurrentIndex + 1), 5000);

  const heroCarousel = document.querySelector('.hero-carousel');
  if (heroCarousel) heroCarousel.addEventListener('mouseenter', () => clearInterval(heroAutoplay));
}

// ── MENÚ LATERAL (hamburguesa) ──
const hamburgerBtn = document.getElementById('hamburgerBtn');
const closeMenuBtn = document.getElementById('closeMenuBtn');
const sideMenu     = document.getElementById('sideMenu');
const overlay      = document.getElementById('overlay');

function openMenu() {
  if (!sideMenu || !overlay) return;
  sideMenu.classList.add('open');
  overlay.classList.add('show');
  sideMenu.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  if (!sideMenu || !overlay) return;
  sideMenu.classList.remove('open');
  overlay.classList.remove('show');
  sideMenu.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

if (hamburgerBtn) hamburgerBtn.addEventListener('click', openMenu);
if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
if (overlay)      overlay.addEventListener('click', closeMenu);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu();
});

document.querySelectorAll('.side-menu-nav a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

// ── SMOOTH SCROLL ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});