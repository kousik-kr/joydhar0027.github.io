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
const newsBoard = document.querySelector('[data-news-board]');
const newsFeed = document.querySelector('[data-news-feed]');
const newsDots = document.querySelector('[data-news-dots]');

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

if (newsBoard && newsFeed) {
  const visibleNewsCount = 3;
  const newsItems = Array.from(newsFeed.querySelectorAll('.news-entry'))
    .map((item, index) => ({
      index,
      date: item.dataset.newsDate || '',
      content: item.innerHTML
    }))
    .sort((left, right) => new Date(right.date) - new Date(left.date));

  let newsIndex = 0;
  let newsRotationId = null;
  let pauseNewsRotation = false;

  function renderNews() {
    const visibleItems = newsItems.length <= visibleNewsCount
      ? newsItems
      : Array.from({ length: visibleNewsCount }, (_, offset) => newsItems[(newsIndex + offset) % newsItems.length]);

    newsFeed.innerHTML = visibleItems
      .map((item) => `<li class="news-entry">${item.content}</li>`)
      .join('');

    if (!newsDots) {
      return;
    }

    const dotCount = newsItems.length > visibleNewsCount ? newsItems.length : 1;
    newsDots.innerHTML = Array.from({ length: dotCount }, (_, dotIndex) => `
      <button
        class="news-board__dot${dotIndex === newsIndex ? ' is-active' : ''}"
        type="button"
        aria-label="Show news group ${dotIndex + 1}"
        data-news-dot="${dotIndex}"
      ></button>
    `).join('');
  }

  function advanceNews() {
    if (newsItems.length <= visibleNewsCount) {
      return;
    }

    newsIndex = (newsIndex + 1) % newsItems.length;
    renderNews();
  }

  function startNewsRotation() {
    if (prefersReducedMotion || newsItems.length <= visibleNewsCount || newsRotationId !== null) {
      return;
    }

    newsRotationId = window.setInterval(() => {
      if (!pauseNewsRotation) {
        advanceNews();
      }
    }, 4500);
  }

  function stopNewsRotation() {
    if (newsRotationId === null) {
      return;
    }

    window.clearInterval(newsRotationId);
    newsRotationId = null;
  }

  function updateNewsBoardVisibility() {
    const threshold = openingStage ? Math.max(180, openingStage.offsetHeight * 0.4) : 220;
    newsBoard.classList.toggle('is-visible', window.scrollY > threshold);
  }

  newsBoard.addEventListener('mouseenter', () => {
    pauseNewsRotation = true;
  });

  newsBoard.addEventListener('mouseleave', () => {
    pauseNewsRotation = false;
  });

  newsBoard.addEventListener('focusin', () => {
    pauseNewsRotation = true;
  });

  newsBoard.addEventListener('focusout', (event) => {
    if (!newsBoard.contains(event.relatedTarget)) {
      pauseNewsRotation = false;
    }
  });

  if (newsDots) {
    newsDots.addEventListener('click', (event) => {
      const dot = event.target.closest('[data-news-dot]');
      if (!dot) {
        return;
      }

      newsIndex = Number(dot.dataset.newsDot) || 0;
      renderNews();
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopNewsRotation();
      return;
    }

    startNewsRotation();
  });

  renderNews();
  startNewsRotation();
  updateNewsBoardVisibility();
  window.addEventListener('scroll', updateNewsBoardVisibility, { passive: true });
  window.addEventListener('resize', updateNewsBoardVisibility);
}
