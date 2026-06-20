const sideLinks = Array.from(document.querySelectorAll('.side-link'));
const years = Array.from(document.querySelectorAll('.current-year'));

const now = new Date().getFullYear();
years.forEach((yearNode) => {
  yearNode.textContent = String(now);
});

// Enable smooth scroll behavior
document.documentElement.style.scrollBehavior = 'smooth';

// Sidebar toggle and active page state
const sideNav = document.querySelector('#sideNav');
const sideNavToggle = document.querySelector('#sideNavToggle');
const sideNavStorageKey = 'joyDharSideNavCollapsed';

function setSideNavState(isCollapsed, shouldPersist = true) {
  document.body.classList.toggle('nav-collapsed', isCollapsed);

  if (sideNav) {
    sideNav.classList.toggle('collapsed', isCollapsed);
    sideNav.classList.toggle('expanded', !isCollapsed);
  }

  if (sideNavToggle) {
    sideNavToggle.setAttribute('aria-expanded', String(!isCollapsed));
    sideNavToggle.setAttribute(
      'aria-label',
      isCollapsed ? 'Expand side navigation' : 'Collapse side navigation'
    );
  }

  if (shouldPersist) {
    localStorage.setItem(sideNavStorageKey, String(isCollapsed));
  }
}

if (sideNav && sideNavToggle) {
  const savedState = localStorage.getItem(sideNavStorageKey);
  const startsCollapsed = savedState === 'true' || (!savedState && window.innerWidth <= 760);
  setSideNavState(startsCollapsed, false);

  sideNavToggle.addEventListener('click', () => {
    setSideNavState(!document.body.classList.contains('nav-collapsed'));
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth <= 560 && localStorage.getItem(sideNavStorageKey) === null) {
      setSideNavState(true, false);
    }
  });
}

const currentPage = window.location.pathname.split('/').pop() || 'index.html';

sideLinks.forEach((link, index) => {
  const linkPage = link.getAttribute('href');

  if (linkPage === currentPage) {
    link.classList.add('active');
    link.setAttribute('aria-current', 'page');
  } else {
    link.classList.remove('active');
    link.removeAttribute('aria-current');
  }

  link.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
      return;
    }

    event.preventDefault();
    const step = event.key === 'ArrowDown' ? 1 : -1;
    const next = (index + step + sideLinks.length) % sideLinks.length;
    sideLinks[next].focus();
  });
});

const rail = document.createElement('div');
rail.className = 'progress-rail';
rail.innerHTML = '<div class="progress-fill"></div>';
document.body.appendChild(rail);

const fill = rail.querySelector('.progress-fill');

function updateProgress() {
  const scrollTop = window.scrollY;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = scrollHeight > 0 ? Math.min(1, scrollTop / scrollHeight) : 0;
  fill.style.width = `${Math.round(ratio * 100)}%`;
}

window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

const revealItems = Array.from(document.querySelectorAll('.reveal'));

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  },
  { threshold: 0.15 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const tiltCards = Array.from(document.querySelectorAll('.tilt-card'));

tiltCards.forEach((card) => {
  card.addEventListener('mousemove', (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rx = ((y / rect.height) - 0.5) * -3;
    const ry = ((x / rect.width) - 0.5) * 3;

    card.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(8px) scale(1.01)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1200px) rotateX(0) rotateY(0) translateZ(0) scale(1)';
  });
});

for (let i = 0; i < 12; i += 1) {
  const dot = document.createElement('span');
  dot.className = 'float-dot';
  dot.style.left = `${Math.random() * 100}%`;
  dot.style.top = `${Math.random() * 100}%`;
  dot.style.setProperty('--dur', `${4 + Math.random() * 7}s`);
  document.body.appendChild(dot);
}

const openingStage = document.querySelector('#opening-stage');
const openingBackgrounds = [
  'images/IMG_3562.jpeg',
  'images/IMG_6723(1).jpeg',
  'images/IMG_5084(1).jpeg',
  'images/IMG_5443(1).jpeg',
  'images/IMG_7194(1).jpeg'
];

if (openingStage) {
  let openingBackgroundIndex = 0;

  function setOpeningBackground() {
    openingStage.style.backgroundImage = `url("${openingBackgrounds[openingBackgroundIndex]}")`;
    openingBackgroundIndex = (openingBackgroundIndex + 1) % openingBackgrounds.length;
  }

  setOpeningBackground();

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setInterval(setOpeningBackground, 5000);
  }
}

const openingOrbs = Array.from(document.querySelectorAll('.opening-orb'));

if (openingStage) {
  const openingHeight = openingStage.offsetHeight || 1;

  function updateOpeningState() {
    const top = window.scrollY;
    const ratio = Math.min(1, top / openingHeight);

    openingStage.style.opacity = `${1 - ratio * 0.42}`;
    openingStage.style.transform = `translateY(${ratio * -16}px)`;

    openingOrbs.forEach((orb, idx) => {
      const depth = (idx + 1) * 6;
      orb.style.transform = `translate3d(${ratio * depth}px, ${ratio * -depth}px, 0)`;
    });

    if (top > openingHeight * 0.28) {
      document.body.classList.add('home-entered');
    } else {
      document.body.classList.remove('home-entered');
    }
  }

  window.addEventListener('scroll', updateOpeningState, { passive: true });
  window.addEventListener('resize', updateOpeningState);
  updateOpeningState();
}
