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

// ─── SKY ──────────────────────────────────────────────────
// --journey goes from 0 at the top of the page to 1 at the bottom; CSS uses it to fade night into dawn.
(function initSky() {
  let queued = false;
  const update = () => {
    const max = Math.max(1, root.scrollHeight - window.innerHeight);
    root.style.setProperty('--journey', Math.min(1, Math.max(0, window.scrollY / max)).toFixed(3));
    queued = false;
  };
  window.addEventListener('scroll', () => {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', update);
  window.addEventListener('load', update);
  update();
})();

// ─── ANNOUNCEMENT BANNER ──────────────────────────────────
(function initBanner() {
  const BANNER_KEY = 'sba-banner-dismissed-2026-10';
  if (sessionStorage.getItem(BANNER_KEY)) return;

  const banner = document.createElement('div');
  banner.className = 'announce-banner';
  banner.id = 'announceBanner';
  banner.innerHTML = `
    <span class="announce-dot" aria-hidden="true"></span>
    <span>Next general meeting: <span data-meeting-date="short">Wednesday</span>, 2:30 to 4:00 PM.
      <span class="announce-countdown" data-meeting-countdown><span class="announce-timer">Starts in <span data-meeting-left></span></span><span class="countdown-live">Happening now.</span></span></span>
    <a href="club.html#join">How to join →</a>
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

        // While hovering, steer only when the rocket is still moving toward the cursor.
        // Once it catches up, hold the last heading instead of snapping back upright.
        let targetRotDeg = currentRot;
        if (isHovering) {
          if (dist > 6) targetRotDeg = Math.atan2(dy, dx) * 180 / Math.PI + 90;
        } else {
          targetRotDeg = Math.sin(idleTime) * 10;
        }

        let diff = targetRotDeg - currentRot;
        diff = ((diff + 180) % 360) - 180;
        currentRot += diff * 0.07;

        rocket.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%) rotate(${currentRot}deg)`;
        rocket.style.opacity = rocketOpacity.toFixed(3);

        particleThrottle++;
        // Keep the exhaust trail running even when the rocket is holding still
        if (particleThrottle >= 5) {
          spawnParticle(currentX, currentY, currentRot);
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

  // ─── HEADER TEAMS DROPDOWN ─────────────────────────────────
  // Opens on hover/focus via CSS; the chevron button also toggles it for touch and keyboard users.
  const teamsDropdown = document.getElementById('teamsDropdown');
  if (teamsDropdown) {
    const toggle = teamsDropdown.querySelector('.nav-dropdown-toggle');
    const setOpen = (open) => {
      teamsDropdown.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open);
    };
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      setOpen(!teamsDropdown.classList.contains('open'));
    });
    document.addEventListener('click', (e) => { if (!teamsDropdown.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    teamsDropdown.querySelectorAll('.nav-dropdown-menu a').forEach(a => a.addEventListener('click', () => {
      setOpen(false);
      a.blur();
    }));
  }

  // ─── TEAMS PAGE SECTIONS ───────────────────────────────────
  // One team shows at a time; the URL hash (teams.html#techrise) picks which.
  const teamPanels = [...document.querySelectorAll('.team-panel')];
  if (teamPanels.length) {
    const showTeam = (id, scroll) => {
      if (!teamPanels.some(p => p.id === id)) id = teamPanels[0].id;
      teamPanels.forEach(p => { p.hidden = p.id !== id; });
      document.querySelectorAll('.nav-dropdown-menu a, .mobile-subnav a').forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === 'teams.html#' + id);
      });
      // The panel was hidden when the browser tried to jump to it, so scroll once it's visible
      if (scroll) document.getElementById(id).scrollIntoView({ block: 'start' });
    };
    window.addEventListener('hashchange', () => showTeam(location.hash.slice(1), true));
    showTeam(location.hash.slice(1), !!location.hash);
  }

  // ─── TEAM ROSTERS: season switcher ─────────────────────────
  document.querySelectorAll('[data-roster]').forEach(roster => {
    const tabs = [...roster.querySelectorAll('.roster-tab')];
    const years = [...roster.querySelectorAll('.roster-year')];
    if (!tabs.length) return;
    const show = (year) => {
      tabs.forEach(t => {
        const on = t.dataset.year === year;
        t.classList.toggle('active', on);
        t.setAttribute('aria-selected', on);
        t.tabIndex = on ? 0 : -1;
      });
      years.forEach(panel => { panel.hidden = panel.dataset.year !== year; });
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => show(t.dataset.year));
      t.addEventListener('keydown', e => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        show(next.dataset.year);
        next.focus();
      });
    });
    show(tabs[0].dataset.year);
  });

  // ─── PHOTO VIEWER ──────────────────────────────────────────
  // Any <img data-lightbox="group"> opens full screen; arrows step through images in the same group
  // (one group per project or photo box). Images inside a hidden .lightbox-extra only appear in the viewer.
  // data-full points to a larger file when there is one; the caption comes from data-caption or alt.
  const lbImages = [...document.querySelectorAll('img[data-lightbox]')];
  const isExtra = (el) => !!el.closest('.lightbox-extra');
  if (lbImages.length) {
    const box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Photo viewer');
    box.hidden = true;
    box.innerHTML = `
      <button class="lightbox-btn lightbox-close" type="button" aria-label="Close photo viewer">&times;</button>
      <button class="lightbox-btn lightbox-prev" type="button" aria-label="Previous photo">&#8249;</button>
      <figure class="lightbox-figure">
        <img class="lightbox-img" alt="" />
        <figcaption class="lightbox-caption"><span class="lightbox-text"></span><span class="lightbox-count"></span></figcaption>
      </figure>
      <button class="lightbox-btn lightbox-next" type="button" aria-label="Next photo">&#8250;</button>`;
    document.body.appendChild(box);
    const lbImg = box.querySelector('.lightbox-img');
    const lbText = box.querySelector('.lightbox-text');
    const lbCount = box.querySelector('.lightbox-count');
    const prevBtn = box.querySelector('.lightbox-prev');
    const nextBtn = box.querySelector('.lightbox-next');
    let group = [], index = 0, opener = null;

    const show = (i) => {
      index = (i + group.length) % group.length;
      const img = group[index];
      lbImg.src = img.dataset.full || img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lbText.textContent = img.dataset.caption || img.alt;
      lbCount.textContent = group.length > 1 ? `${index + 1} / ${group.length}` : '';
      prevBtn.hidden = nextBtn.hidden = group.length < 2;
    };
    const open = (img) => {
      group = lbImages.filter(el => el.dataset.lightbox === img.dataset.lightbox && (isExtra(el) || el.offsetParent !== null));
      if (!group.includes(img)) group = [img];
      opener = img;
      show(group.indexOf(img));
      box.hidden = false;
      document.body.classList.add('lightbox-open');
      box.querySelector('.lightbox-close').focus();
    };
    const close = () => {
      box.hidden = true;
      document.body.classList.remove('lightbox-open');
      lbImg.removeAttribute('src');
      if (opener) opener.focus();
    };

    const zoomIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">' +
      '<circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5 L20.5 20.5" /><path d="M10.5 7.8 V13.2 M7.8 10.5 H13.2" /></svg>';
    lbImages.filter(img => !isExtra(img)).forEach(img => {
      // wrap so a small magnifier button can sit on the photo's corner
      const wrap = document.createElement('span');
      wrap.className = 'zoom-wrap';
      img.parentNode.insertBefore(wrap, img);
      wrap.appendChild(img);
      const badge = document.createElement('span');
      badge.className = 'zoom-badge';
      badge.setAttribute('aria-hidden', 'true');
      badge.innerHTML = zoomIcon;
      wrap.appendChild(badge);
      img.tabIndex = 0;
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', 'View larger: ' + img.alt);
      img.classList.add('zoomable');
      img.addEventListener('click', () => open(img));
      img.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(img); }
      });
    });
    box.querySelector('.lightbox-close').addEventListener('click', close);
    prevBtn.addEventListener('click', () => show(index - 1));
    nextBtn.addEventListener('click', () => show(index + 1));
    box.addEventListener('click', e => { if (e.target === box) close(); });
    document.addEventListener('keydown', e => {
      if (box.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft' && group.length > 1) show(index - 1);
      else if (e.key === 'ArrowRight' && group.length > 1) show(index + 1);
      else if (e.key === 'Tab') {
        // keep focus inside the viewer
        const focusables = [...box.querySelectorAll('button:not([hidden])')];
        const first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    // swipe left/right on touch screens
    let touchX = null;
    box.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', e => {
      if (touchX === null || group.length < 2) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
      touchX = null;
    });
  }

  // ─── NEXT GENERAL MEETING ──────────────────────────────────
  // General meetings are the third Wednesday of every month, 2:30 to 4:00 PM Eastern,
  // so the date and countdown work themselves out instead of being typed in each month.
  const meetingDates = document.querySelectorAll('[data-meeting-date]');
  const meetingCountdowns = document.querySelectorAll('[data-meeting-countdown]');
  if (meetingDates.length || meetingCountdowns.length) {
    const ZONE = 'America/New_York';
    const easternParts = date => Object.fromEntries(new Intl.DateTimeFormat('en-US', {
      timeZone: ZONE, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric'
    }).formatToParts(date).map(p => [p.type, Number(p.value)]));
    // A wall-clock time in New Jersey as a real Date, whatever time zone the visitor is in
    const easternTime = (y, m, d, h, min) => {
      const guess = Date.UTC(y, m, d, h, min);
      const p = easternParts(new Date(guess));
      const offset = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - guess;
      return new Date(guess - offset);
    };
    const thirdWednesday = (y, m) => 1 + (3 - new Date(Date.UTC(y, m, 1)).getUTCDay() + 7) % 7 + 14;
    const nextMeeting = now => {
      const today = easternParts(now);
      let y = today.year, m = today.month - 1;
      for (;;) {
        const day = thirdWednesday(y, m);
        const end = easternTime(y, m, day, 16, 0);
        if (now < end) return { start: easternTime(y, m, day, 14, 30), end };
        if (++m > 11) { m = 0; y++; }
      }
    };
    const pad = n => String(n).padStart(2, '0');
    let meeting = nextMeeting(new Date());

    const tick = () => {
      const now = new Date();
      if (now >= meeting.end) meeting = nextMeeting(now);
      const month = el => el.dataset.meetingDate === 'short' ? 'short' : 'long';
      meetingDates.forEach(el => {
        const label = meeting.start.toLocaleDateString('en-US', { timeZone: ZONE, weekday: 'long', month: month(el), day: 'numeric' });
        if (el.textContent !== label) el.textContent = label;
      });

      const left = Math.max(0, Math.floor((meeting.start - now) / 1000));
      const units = {
        days: Math.floor(left / 86400),
        hours: Math.floor(left % 86400 / 3600),
        minutes: Math.floor(left % 3600 / 60),
        seconds: left % 60
      };
      const compact = (units.days ? units.days + 'd ' : '') + `${pad(units.hours)}h ${pad(units.minutes)}m ${pad(units.seconds)}s`;
      meetingCountdowns.forEach(box => {
        box.classList.toggle('is-live', now >= meeting.start);
        box.querySelectorAll('[data-unit]').forEach(el => { el.textContent = pad(units[el.dataset.unit]); });
        box.querySelectorAll('[data-meeting-left]').forEach(el => { el.textContent = compact; });
      });
    };
    tick();
    if (meetingCountdowns.length) setInterval(tick, 1000);
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

