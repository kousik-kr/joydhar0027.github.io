const years = Array.from(document.querySelectorAll('.current-year'));
const tabLinks = Array.from(document.querySelectorAll('.tab-link'));
const navShell = document.querySelector('.nav-shell');
const navToggle = document.querySelector('.nav-compact-toggle');
const tabNav = document.querySelector('.tab-nav');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

years.forEach((yearNode) => {
  yearNode.textContent = String(new Date().getFullYear());
});

document.documentElement.style.scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';

function setNavCollapsed(collapsed) {
  if (!navShell || !navToggle || !tabNav) {
    return;
  }

  navShell.classList.toggle('is-collapsed', collapsed);
  navToggle.setAttribute('aria-expanded', String(!collapsed));

  const textNode = navToggle.querySelector('.nav-toggle-text');
  if (textNode) {
    textNode.textContent = collapsed ? 'Expand Navigation' : 'Shrink Navigation';
  }
}

if (navShell && navToggle && tabNav) {
  const storedPreference = window.localStorage.getItem('navCollapsed');
  const defaultCollapsed = storedPreference === null ? window.innerWidth < 760 : storedPreference === 'true';
  setNavCollapsed(defaultCollapsed);

  navToggle.addEventListener('click', () => {
    const collapsed = !navShell.classList.contains('is-collapsed');
    setNavCollapsed(collapsed);
    window.localStorage.setItem('navCollapsed', String(collapsed));
  });

  tabLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 760) {
        setNavCollapsed(true);
        window.localStorage.setItem('navCollapsed', 'true');
      }
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !navShell.classList.contains('is-collapsed')) {
      setNavCollapsed(true);
      window.localStorage.setItem('navCollapsed', 'true');
    }
  });
}

tabLinks.forEach((link, index) => {
  link.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
      return;
    }

    event.preventDefault();
    const step = event.key === 'ArrowRight' ? 1 : -1;
    const next = (index + step + tabLinks.length) % tabLinks.length;
    tabLinks[next].focus();
  });
});

const rail = document.createElement('div');
rail.className = 'progress-rail';
rail.innerHTML = '<div class="progress-fill"></div>';
document.body.appendChild(rail);

const fill = rail.querySelector('.progress-fill');

function updateProgress() {
  if (!fill) {
    return;
  }

  const scrollTop = window.scrollY;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = scrollHeight > 0 ? Math.min(1, scrollTop / scrollHeight) : 0;
  fill.style.width = `${Math.round(ratio * 100)}%`;
}

window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

const revealItems = Array.from(document.querySelectorAll('.reveal'));

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('in-view'));
}

if (!prefersReducedMotion) {
  const dotCount = window.innerWidth < 720 ? 6 : 12;
  for (let i = 0; i < dotCount; i += 1) {
    const dot = document.createElement('span');
    dot.className = 'float-dot';
    dot.style.left = `${Math.random() * 100}%`;
    dot.style.top = `${Math.random() * 100}%`;
    dot.style.setProperty('--dur', `${4 + Math.random() * 7}s`);
    document.body.appendChild(dot);
  }
}

const openingStage = document.querySelector('#opening-stage');
const openingOrbs = Array.from(document.querySelectorAll('.opening-orb'));

if (openingStage && !prefersReducedMotion) {
  const openingHeight = openingStage.offsetHeight || 1;

  function updateOpeningState() {
    const top = window.scrollY;
    const ratio = Math.min(1, top / openingHeight);

    openingStage.style.opacity = `${1 - ratio * 0.38}`;
    openingStage.style.transform = `translateY(${ratio * -12}px)`;

    openingOrbs.forEach((orb, idx) => {
      const depth = (idx + 1) * 5;
      orb.style.transform = `translate3d(${ratio * depth}px, ${ratio * -depth}px, 0)`;
    });
  }

  window.addEventListener('scroll', updateOpeningState, { passive: true });
  window.addEventListener('resize', updateOpeningState);
  updateOpeningState();
}
