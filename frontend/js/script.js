// ── CAROUSEL PRODUCTOS ──
const track = document.getElementById('carouselTrack');
const dotsContainer = document.getElementById('carouselDots');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let allCards = [...track.querySelectorAll('.product-card')];
let visibleCards = [...allCards];
let currentIndex = 0;
let cardsPerView = 3;

function getCardsPerView() {
  return window.innerWidth < 900 ? 1 : 3;
}

function buildDots() {
  dotsContainer.innerHTML = '';
  const totalSlides = Math.ceil(visibleCards.length / cardsPerView);
  for (let i = 0; i < totalSlides; i++) {
    const d = document.createElement('div');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(d);
  }
}

function updateDots() {
  const slide = Math.floor(currentIndex / cardsPerView);
  dotsContainer.querySelectorAll('.dot').forEach((d, i) => {
    d.className = 'dot' + (i === slide ? ' active' : '');
  });
}

function goTo(slideIndex) {
  const maxSlide = Math.ceil(visibleCards.length / cardsPerView) - 1;
  if (slideIndex < 0) slideIndex = maxSlide;
  if (slideIndex > maxSlide) slideIndex = 0;
  currentIndex = slideIndex * cardsPerView;
  const gap = 24;
  const cardWidth = track.querySelector('.product-card').offsetWidth + gap;
  track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
  updateDots();
}

prevBtn.addEventListener('click', () => goTo(Math.floor(currentIndex / cardsPerView) - 1));
nextBtn.addEventListener('click', () => goTo(Math.floor(currentIndex / cardsPerView) + 1));

// ── FILTER TABS ──
document.getElementById('filterTabs').addEventListener('click', (e) => {
  if (!e.target.matches('.filter-tab')) return;
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  e.target.classList.add('active');

  const filter = e.target.dataset.filter;
  allCards.forEach(card => {
    if (filter === 'todos' || card.dataset.cat === filter) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });

  visibleCards = allCards.filter(c => c.style.display !== 'none');
  currentIndex = 0;
  track.style.transform = 'translateX(0)';
  buildDots();
  updateDots();
});

window.addEventListener('resize', () => {
  cardsPerView = getCardsPerView();
  currentIndex = 0;
  track.style.transform = 'translateX(0)';
  buildDots();
  updateDots();
});

// ── INIT CAROUSEL PRODUCTOS ──
cardsPerView = getCardsPerView();
buildDots();

// ── CAROUSEL HERO ──
let heroCurrentIndex = 0;
const heroTotalSlides = 3;
const heroTrack = document.getElementById('heroTrack');
const heroDots = document.querySelectorAll('.carousel-dot');

function heroGoTo(n) {
  heroCurrentIndex = (n + heroTotalSlides) % heroTotalSlides;
  heroTrack.style.transform = `translateX(-${heroCurrentIndex * 100}%)`;
  heroDots.forEach((d, i) => {
    d.classList.toggle('active', i === heroCurrentIndex);
    d.setAttribute('aria-selected', i === heroCurrentIndex);
  });
}

document.getElementById('heroPrev').addEventListener('click', () => heroGoTo(heroCurrentIndex - 1));
document.getElementById('heroNext').addEventListener('click', () => heroGoTo(heroCurrentIndex + 1));
heroDots.forEach(d => d.addEventListener('click', () => heroGoTo(+d.dataset.index)));

const heroAutoplay = setInterval(() => heroGoTo(heroCurrentIndex + 1), 5000);

// Pausa autoplay al hover
document.querySelector('.hero-carousel').addEventListener('mouseenter', () => clearInterval(heroAutoplay));

// ── MENÚ LATERAL (hamburguesa) ──
const hamburgerBtn = document.getElementById('hamburgerBtn');
const closeMenuBtn = document.getElementById('closeMenuBtn');
const sideMenu     = document.getElementById('sideMenu');
const overlay      = document.getElementById('overlay');

function openMenu() {
  sideMenu.classList.add('open');
  overlay.classList.add('show');
  sideMenu.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  sideMenu.classList.remove('open');
  overlay.classList.remove('show');
  sideMenu.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

hamburgerBtn.addEventListener('click', openMenu);
closeMenuBtn.addEventListener('click', closeMenu);
overlay.addEventListener('click', closeMenu);

// Cierra con tecla Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu();
});

// Cierra al hacer clic en cualquier link del sidebar
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

// ── ADD TO CART FEEDBACK ──
document.querySelectorAll('.add-cart-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const orig = btn.textContent;
    btn.textContent = '✓';
    btn.style.background = '#2ecc71';
    setTimeout(() => { btn.textContent = orig; btn.style.background = ''; }, 1000);
  });
});