// ─── THEME ─────────────────────────────────────────────────
const THEME_KEY = 'sba-theme';
const root = document.documentElement;

function applyTheme(theme) {
  root.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
}

(function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved || (prefersDark ? 'dark' : 'light'));
})();

// ─── ANNOUNCEMENT BANNER ──────────────────────────────────
(function initBanner() {
  const BANNER_KEY = 'sba-banner-dismissed-2026-10';
  if (sessionStorage.getItem(BANNER_KEY)) return;

  const banner = document.createElement('div');
  banner.className = 'announce-banner';
  banner.id = 'announceBanner';
  banner.innerHTML = `
    <span>Next general meeting: Wednesday, Oct 21, 2:30 to 4:00 PM. All SBHS students are welcome.</span>
    <a href="tryouts.html">Membership info →</a>
    <button class="announce-banner-close" aria-label="Dismiss announcement" id="bannerClose">✕</button>
  `;
  // Insert before header (first element of body)
  document.body.insertBefore(banner, document.body.firstChild);

  document.getElementById('bannerClose').addEventListener('click', () => {
    banner.classList.add('hidden');
    sessionStorage.setItem(BANNER_KEY, '1');
  });
})();

// ─── DYNAMIC COPYRIGHT YEAR ───────────────────────────────
document.querySelectorAll('#copy-year').forEach(el => { el.textContent = new Date().getFullYear(); });

document.addEventListener('DOMContentLoaded', function () {

  // ─── THEME TOGGLE ─────────────────────────────────────────
  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = root.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // ─── MOBILE NAV ──────────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      // Start the menu below the header, which sits lower while the announcement banner is visible
      const header = document.querySelector('header');
      if (header) mobileNav.style.top = Math.max(0, header.getBoundingClientRect().bottom) + 'px';
      const open = mobileNav.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', open);
    });
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', false);
      });
    });
  }

  // ─── ACTIVE NAV LINK ─────────────────────────────────────
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // ─── SCROLL REVEAL ───────────────────────────────────────
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length > 0) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => obs.observe(el));
  }

  // ─── WORK PAGE TABS ──────────────────────────────────────
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  if (tabBtns.length > 0) {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
        tabPanels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        const target = document.getElementById(btn.dataset.tab);
        if (target) target.classList.add('active');
      });
    });
  }

  // ─── PROGRAM SELECTOR ─────────────────────────────────────
  const programItems = document.querySelectorAll('.program-item');
  const programDetail = document.getElementById('programDetail');

  const programs = {
    rocketry: {
      title: 'Rocketry',
      desc: 'We design, assemble, and launch competition rockets: airframes, fins, parachute recovery systems, and aerodynamic flight calculations.',
      features: ['ARC competition builds', 'OpenRocket & RASAero simulation', 'Composite and fiberglass airframes', 'Dual-deploy recovery systems'],
    },
    electronics: {
      title: 'Electronics',
      desc: 'Custom avionics, PCB design, and embedded firmware, ranging from flight computers to ground station radios.',
      features: ['KiCad schematic & PCB layout', 'Microcontroller firmware (C/Python)', 'RF telemetry systems', 'Custom flight data logging'],
    },
    mechanical: {
      title: 'Mechanical',
      desc: 'CAD modeling and hands-on fabrication for rocket airframes, aero surfaces, custom test rigs, and vehicle chassis.',
      features: ['SolidWorks & Fusion 360 CAD', 'FEA structural analysis', 'Composite manufacturing', 'CNC milling & 3D printing'],
    },
    software: {
      title: 'Software',
      desc: 'Flight simulation pipelines, real-time telemetry dashboards, and data analysis tools used across our competition teams.',
      features: ['Flight path simulation', 'Real-time telemetry dashboards', 'Data analysis & visualization', 'Embedded Python & C++ firmware'],
    },
  };

  function updateProgram(key) {
    if (!programDetail || !programs[key]) return;
    const p = programs[key];
    programDetail.innerHTML = `
      <h2>${p.title}</h2>
      <p>${p.desc}</p>
      <div class="program-detail-features">
        ${p.features.map(f => `<div class="program-feature">${f}</div>`).join('')}
      </div>`;
  }

  if (programItems.length > 0) {
    programItems.forEach(item => {
      item.addEventListener('click', () => {
        programItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        updateProgram(item.dataset.program);
      });
    });
    const first = programItems[0];
    first.classList.add('active');
    updateProgram(first.dataset.program);
  }

  // ─── FAQ ACCORDION ────────────────────────────────────────
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-q');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.toggle('open');
      const answer = item.querySelector('.faq-a');
      if (answer) answer.style.maxHeight = isOpen ? answer.scrollHeight + 'px' : '0';
    });
  });

  // ─── COPY CLASSROOM CODE ──────────────────────────────────
  const copyBtn = document.getElementById('copyCode');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const code = copyBtn.dataset.code || '';
      navigator.clipboard.writeText(code).then(() => {
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.textContent = 'Copy code';
          copyBtn.classList.remove('copied');
        }, 2000);
      });
    });
  }

  // ─── ANIMATE HERO BARS ────────────────────────────────────
  const bars = document.querySelectorAll('.widget-bar');
  setTimeout(() => {
    bars.forEach(bar => { bar.style.width = bar.dataset.pct || '70%'; });
  }, 600);

  // ─── HERO INTERACTIVE ROCKET ──────────────────────────────
  const hero = document.querySelector('.hero');
  const rocket = document.getElementById('heroRocket');
  const scene = document.querySelector('.hero-interactive-scene');

  if (hero && rocket && scene) {
    // Use a small dark opacity initially via inline style so CSS transition doesn't block
    rocket.style.opacity = '0';

    let currentX = window.innerWidth * 0.78;
    let currentY = window.innerHeight * 0.35;
    let targetX = currentX;
    let targetY = currentY;
    let currentRot = 0;
    let isHovering = false;
    let idleTime = 0;
    let particleThrottle = 0;
    let initialized = false;

    function getDefaultX() { return window.innerWidth * 0.78; }
    function getDefaultY() { return window.innerHeight * 0.35; }

    window.addEventListener('resize', () => {
      if (!isHovering) {
        targetX = getDefaultX();
        targetY = getDefaultY();
      }
    });

    hero.addEventListener('mousemove', (e) => {
      isHovering = true;
      const rect = hero.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
    });

    hero.addEventListener('mouseleave', () => {
      isHovering = false;
    });

    function spawnParticle(x, y, rotation) {
      const particle = document.createElement('div');
      particle.className = 'rocket-particle';

      // CSS rotate(deg) is clockwise. At rotation=0 rocket points up; nozzle is 40px below center.
      // Rotating local vector (0, +40) clockwise by `rotation` degrees in screen coords (where +Y is down):
      //   x_new = localX * cos(rot) - localY * sin(rot) = -40 * sin(rot)
      //   y_new = localX * sin(rot) + localY * cos(rot) = 40 * cos(rot)
      const angleRad = rotation * Math.PI / 180;
      const sinA = Math.sin(angleRad);
      const cosA = Math.cos(angleRad);
      const nozzleOffset = 40; // px from SVG center to nozzle exit

      particle.style.left = `${x - sinA * nozzleOffset}px`;
      particle.style.top  = `${y + cosA * nozzleOffset}px`;
      scene.appendChild(particle);

      // Exhaust shoots opposite to nose direction
      // Since nose direction is (sinA, -cosA), the exhaust direction is (-sinA, cosA)
      const speed = 12 + Math.random() * 14;
      const driftX = -sinA * speed + (Math.random() - 0.5) * 6;
      const driftY = cosA * speed + (Math.random() - 0.5) * 6;

      requestAnimationFrame(() => {
        particle.style.transform = `translate(calc(-50% + ${driftX}px), calc(-50% + ${driftY}px)) scale(0.2)`;
        particle.style.opacity = '0';
      });

      setTimeout(() => { particle.remove(); }, 800);
    }

    function animateRocket() {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      // Get hero height safely - fallback to window.innerHeight if not yet laid out
      const heroHeight = hero.offsetHeight || window.innerHeight;

      // Fade out as user scrolls, disappear fully at scrollY = 500
      const scrollProgress = Math.min(scrollY / 500, 1);
      const rocketOpacity = 0.25 * (1 - scrollProgress);

      if (scrollY < heroHeight + 200) {
        const launchOffset = scrollY * 1.8;

        let activeTargetX = targetX;
        let activeTargetY = targetY - launchOffset;

        if (!isHovering) {
          idleTime += 0.03;
          activeTargetX = getDefaultX() + Math.sin(idleTime) * 32;
          activeTargetY = (getDefaultY() - launchOffset) + Math.cos(idleTime * 0.5) * 18;
        }

        const dx = activeTargetX - currentX;
        const dy = activeTargetY - currentY;
        const dist = Math.hypot(dx, dy);

        currentX += dx * 0.055;
        currentY += dy * 0.055;

        let targetRotDeg = 0;
        if (dist > 2 && isHovering) {
          targetRotDeg = Math.atan2(dy, dx) * 180 / Math.PI + 90;
        } else if (!isHovering) {
          targetRotDeg = Math.sin(idleTime) * 10;
        }

        let diff = targetRotDeg - currentRot;
        diff = ((diff + 180) % 360) - 180;
        currentRot += diff * 0.07;

        rocket.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%) rotate(${currentRot}deg)`;
        rocket.style.opacity = rocketOpacity.toFixed(3);

        particleThrottle++;
        if (particleThrottle >= 5) {
          if (dist > 1.5 || scrollY > 5) {
            spawnParticle(currentX, currentY, currentRot);
          }
          particleThrottle = 0;
        }
      } else {
        rocket.style.opacity = '0';
      }

      requestAnimationFrame(animateRocket);
    }

    // Defer initialization until layout is stable (after first paint)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        currentX = getDefaultX();
        currentY = getDefaultY();
        targetX = getDefaultX();
        targetY = getDefaultY();
        animateRocket();
      });
    });
  }

  // ─── TIMELINE PROGRESS ROCKET ──────────────────────────────
  const timeline = document.querySelector('.timeline');
  const timelineRocket = document.getElementById('timelineRocket');
  
  if (timeline && timelineRocket) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          window.addEventListener('scroll', updateTimelineRocket);
          updateTimelineRocket();
        } else {
          window.removeEventListener('scroll', updateTimelineRocket);
        }
      });
    }, { threshold: 0 });
    observer.observe(timeline);

    function updateTimelineRocket() {
      const rect = timeline.getBoundingClientRect();
      const timelineHeight = rect.height;
      const windowHeight = window.innerHeight;
      
      const currentScroll = windowHeight * 0.5 - rect.top;
      
      let pct = currentScroll / rect.height;
      pct = Math.max(0, Math.min(1, pct));
      
      const trackLength = timelineHeight - 24;
      const translateY = pct * trackLength;
      
      timelineRocket.style.transform = `translateY(${translateY}px) translate(-50%, 0)`;
    }
  }

  // ─── HERO SLIDESHOW ────────────────────────────────────────
  const heroSlideshow = document.getElementById('heroSlideshow');
  if (heroSlideshow) {
    const slides = heroSlideshow.querySelectorAll('.hero-slide');
    const dots = heroSlideshow.querySelectorAll('.hero-slide-dot');
    const prevBtn = document.getElementById('heroSlidePrev');
    const nextBtn = document.getElementById('heroSlideNext');
    const captionTitle = document.getElementById('heroCaptionTitle');
    const captionMeta = document.getElementById('heroCaptionMeta');
    let currentIndex = 0;
    let autoPlayTimer = null;

    function showSlide(index) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      currentIndex = index;

      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === currentIndex);
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });

      const activeSlide = slides[currentIndex];
      if (activeSlide && captionTitle && captionMeta) {
        captionTitle.textContent = activeSlide.getAttribute('data-title') || '';
        captionMeta.textContent = activeSlide.getAttribute('data-meta') || '';
      }
    }

    function startAutoPlay() {
      stopAutoPlay();
      autoPlayTimer = setInterval(() => {
        showSlide(currentIndex + 1);
      }, 5000);
    }

    function stopAutoPlay() {
      if (autoPlayTimer) clearInterval(autoPlayTimer);
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        showSlide(currentIndex - 1);
        startAutoPlay();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        showSlide(currentIndex + 1);
        startAutoPlay();
      });
    }
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.getAttribute('data-index'), 10);
        showSlide(idx);
        startAutoPlay();
      });
    });

    heroSlideshow.addEventListener('mouseenter', stopAutoPlay);
    heroSlideshow.addEventListener('mouseleave', startAutoPlay);

    startAutoPlay();
  }

});

