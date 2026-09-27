/* =========================================
   HARAYA TEAM — MAIN SCRIPT
   Lahat ng interactive features sa isang file
========================================= */

/* ============ 1. LOADING SCREEN ============ */
(function () {
  const loader = document.getElementById('loader');
  if (!loader) return;

  const startTime = Date.now();

  window.addEventListener('load', function () {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, 1200 - elapsed);

    setTimeout(function () {
      loader.classList.add('loaded');
      document.body.classList.add('loaded');

      setTimeout(function () {
        loader.style.display = 'none';
      }, 800);
    }, remaining);
  });

  // Fallback — kung sobrang tagal mag-load
  setTimeout(function () {
    if (!loader.classList.contains('loaded')) {
      loader.classList.add('loaded');
      document.body.classList.add('loaded');
      setTimeout(function () {
        loader.style.display = 'none';
      }, 800);
    }
  }, 4000);
})();


/* ============ 2. CURSOR TRAIL (cosmic line) ============ */
(function () {
  const canvas = document.getElementById('cursorTrail');
  if (!canvas) return;

  const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!hasHover) {
    canvas.style.display = 'none';
    return;
  }

  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let dpr = window.devicePixelRatio || 1;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);
  }
  resize();
  window.addEventListener('resize', resize);

  const trail = [];
  const MAX_LENGTH = 30;
  const FADE_SPEED = 0.03;

  let mouseX = 0;
  let mouseY = 0;
  let lastMouseX = 0;
  let lastMouseY = 0;

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;

    const dx = mouseX - lastMouseX;
    const dy = mouseY - lastMouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 2) {
      trail.push({
        x: mouseX,
        y: mouseY,
        life: 1,
        size: Math.min(6, 2 + dist * 0.15)
      });

      if (trail.length > MAX_LENGTH) {
        trail.shift();
      }

      lastMouseX = mouseX;
      lastMouseY = mouseY;
    }
  });

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (let i = trail.length - 1; i >= 0; i--) {
      const point = trail[i];
      point.life -= FADE_SPEED;

      if (point.life <= 0) {
        trail.splice(i, 1);
        continue;
      }

      const alpha = point.life;
      const size = point.size * point.life;

      const gradient = ctx.createRadialGradient(
        point.x, point.y, 0,
        point.x, point.y, size * 3
      );
      gradient.addColorStop(0, `rgba(168, 213, 178, ${alpha * 0.9})`);
      gradient.addColorStop(0.4, `rgba(109, 184, 138, ${alpha * 0.5})`);
      gradient.addColorStop(1, 'rgba(74, 140, 107, 0)');

      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(point.x, point.y, size * 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
      ctx.arc(point.x, point.y, size * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Connecting cosmic thread
    if (trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(trail[0].x, trail[0].y);

      for (let i = 1; i < trail.length; i++) {
        const p = trail[i];
        const prev = trail[i - 1];
        const midX = (p.x + prev.x) / 2;
        const midY = (p.y + prev.y) / 2;
        ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
      }

      const last = trail[trail.length - 1];
      const first = trail[0];
      const lineGradient = ctx.createLinearGradient(
        first.x, first.y, last.x, last.y
      );
      lineGradient.addColorStop(0, 'rgba(168, 213, 178, 0)');
      lineGradient.addColorStop(0.5, 'rgba(168, 213, 178, 0.3)');
      lineGradient.addColorStop(1, 'rgba(168, 213, 178, 0)');

      ctx.strokeStyle = lineGradient;
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    requestAnimationFrame(draw);
  }

  draw();
})();


/* ============ 3. NAVBAR AUTO-HIDE ============ */
(function () {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  let lastScrollY = window.scrollY;
  let isHoveringTop = false;
  let ticking = false;
  const SCROLL_THRESHOLD = 80;

  document.addEventListener('mousemove', function (e) {
    const isInTopZone = e.clientY < 100;
    if (isInTopZone !== isHoveringTop) {
      isHoveringTop = isInTopZone;
      updateNavbar();
    }
  });

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        updateNavbar();
        ticking = false;
      });
      ticking = true;
    }
  });

  function updateNavbar() {
    const currentScrollY = window.scrollY;

    if (currentScrollY < SCROLL_THRESHOLD) {
      navbar.classList.remove('navbar-hidden');
      lastScrollY = currentScrollY;
      return;
    }

    if (isHoveringTop) {
      navbar.classList.remove('navbar-hidden');
      lastScrollY = currentScrollY;
      return;
    }

    if (currentScrollY > lastScrollY) {
      navbar.classList.add('navbar-hidden');
    } else {
      navbar.classList.remove('navbar-hidden');
    }

    lastScrollY = currentScrollY;
  }
})();


/* ============ 4. CREATIVE DISPLAY — 3D TILT EFFECT ============ */
/* Optional — gumagana lang kapag may .creative-display at .code-card sa page */
(function () {
  const creativeDisplay = document.querySelector('.creative-display');
  const codeCard = document.querySelector('.code-card');

  if (!creativeDisplay || !codeCard) return;

  const MAX_TILT = 15;
  const TILT_SPEED = 35;
  const LIFT = -5;
  const BASE_ROTATE_Y = -5;

  let rect = creativeDisplay.getBoundingClientRect();
  let ticking = false;
  let lastEvent = null;

  function updateRect() {
    rect = creativeDisplay.getBoundingClientRect();
  }

  function applyTilt() {
    if (!lastEvent) {
      ticking = false;
      return;
    }

    const x = lastEvent.clientX - rect.left;
    const y = lastEvent.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    let rotateY = (x - centerX) / TILT_SPEED;
    let rotateX = (centerY - y) / TILT_SPEED;

    rotateX = Math.max(-MAX_TILT, Math.min(MAX_TILT, rotateX));
    rotateY = Math.max(-MAX_TILT, Math.min(MAX_TILT, rotateY));

    codeCard.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateY(${LIFT}px)
    `;

    ticking = false;
  }

  creativeDisplay.addEventListener('mousemove', function (event) {
    lastEvent = event;
    if (!ticking) {
      window.requestAnimationFrame(applyTilt);
      ticking = true;
    }
  });

  creativeDisplay.addEventListener('mouseleave', function () {
    lastEvent = null;
    codeCard.style.transform = `
      perspective(1000px)
      rotateX(0deg)
      rotateY(${BASE_ROTATE_Y}deg)
      translateY(0)
    `;
  });

  window.addEventListener('resize', updateRect);

  let scrollTicking = false;
  window.addEventListener('scroll', function () {
    if (!scrollTicking) {
      window.requestAnimationFrame(function () {
        updateRect();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  });
})();