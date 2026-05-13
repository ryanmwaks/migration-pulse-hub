/* Migration Pulse Hub — Main JS v2.0 */

document.addEventListener('DOMContentLoaded', () => {

  /* --- Mobile Navigation ---------------------------------------- */
  const hamburger = document.querySelector('.mph-hamburger');
  const navMenu   = document.querySelector('.mph-nav');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navMenu.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        hamburger.classList.remove('open');
        navMenu.classList.remove('open');
      }
    });
  }

  /* --- Active Nav Link ------------------------------------------ */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.mph-nav a').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
      link.closest('li.has-dropdown')?.querySelector('a')?.classList.add('active');
    }
  });

  /* --- Back to Top ---------------------------------------------- */
  const backToTop = document.querySelector('.mph-back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('visible', window.scrollY > 400);
    });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* --- Cinematic Hero Sequence ---------------------------------- */
  (function () {
    const clips = Array.from(document.querySelectorAll('.mph-hero-clip'));
    const dots  = Array.from(document.querySelectorAll('.mph-hero-dot'));
    if (!clips.length) return;

    let current  = 0;
    let timer    = null;
    const DWELL  = 9000;  // ms per clip
    const FADE   = 1800;  // ms — must match CSS transition

    function goTo(idx) {
      const prev = current;
      current = ((idx % clips.length) + clips.length) % clips.length;
      if (prev === current) return;

      // Swap active class
      clips[prev].classList.remove('active');
      dots[prev] && dots[prev].classList.remove('active');
      clips[current].classList.add('active');
      dots[current] && dots[current].classList.add('active');

      // Play incoming video (muted, looped)
      const vid = clips[current].querySelector('video');
      if (vid) { vid.currentTime = 0; vid.play().catch(() => {}); }
    }

    // Start cycling
    function startCycle() {
      clearInterval(timer);
      timer = setInterval(() => goTo(current + 1), DWELL);
    }

    // Dot clicks
    dots.forEach((dot, i) => dot.addEventListener('click', () => {
      goTo(i);
      startCycle(); // reset interval on manual nav
    }));

    // Init first clip's video
    const firstVid = clips[0].querySelector('video');
    if (firstVid) firstVid.play().catch(() => {});
    startCycle();
  })();

  /* --- Accordion / FAQ ------------------------------------------ */
  document.querySelectorAll('.mph-accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const body = header.nextElementSibling;
      const isOpen = header.classList.contains('active');
      document.querySelectorAll('.mph-accordion-header').forEach(h => {
        h.classList.remove('active');
        if (h.nextElementSibling) h.nextElementSibling.classList.remove('show');
      });
      if (!isOpen) {
        header.classList.add('active');
        body.classList.add('show');
      }
    });
  });

  /* --- Scroll Reveal -------------------------------------------- */
  const revealEls = document.querySelectorAll('.mph-reveal');
  if (revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('mph-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealEls.forEach(el => observer.observe(el));
  }

  /* --- Animated Counters ---------------------------------------- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => countObserver.observe(el));
  }

  function animateCount(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1800;
    const start = performance.now();
    const update = (time) => {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * ease).toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  /* --- Hero Slideshow ------------------------------------------- */
  const slideshow = document.querySelector('.mph-hero-slideshow');
  if (slideshow) {
    const slides  = Array.from(slideshow.querySelectorAll('.mph-slide'));
    const dots    = Array.from(slideshow.querySelectorAll('.mph-dot'));
    const prevBtn = slideshow.querySelector('.mph-slide-prev');
    const nextBtn = slideshow.querySelector('.mph-slide-next');
    let current   = 0;
    let timer;

    function goTo(idx) {
      slides[current].classList.remove('active');
      if (dots[current]) dots[current].classList.remove('active');
      current = (idx + slides.length) % slides.length;
      // Restart Ken Burns animation on the incoming slide's image
      const img = slides[current].querySelector('img');
      if (img) { img.style.animation = 'none'; void img.offsetWidth; img.style.animation = ''; }
      slides[current].classList.add('active');
      if (dots[current]) dots[current].classList.add('active');
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(() => goTo(current + 1), 5200);
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); startTimer(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); startTimer(); });
    dots.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); startTimer(); }));

    // Touch swipe support
    let touchStartX = 0;
    slideshow.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    slideshow.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) { goTo(current + (diff > 0 ? 1 : -1)); startTimer(); }
    });

    // Pause on hover
    slideshow.addEventListener('mouseenter', () => clearInterval(timer));
    slideshow.addEventListener('mouseleave', startTimer);

    startTimer();
  }

  /* --- Contact Form --------------------------------------------- */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('[type="submit"]');
      btn.textContent = 'Sending…';
      btn.disabled = true;
      setTimeout(() => {
        contactForm.innerHTML = `
          <div class="mph-notice mph-notice--teal" style="justify-content:center;text-align:center;padding:2.5rem;flex-direction:column;">
            <div style="font-size:2.5rem;margin-bottom:.75rem;">✅</div>
            <strong>Thank you for reaching out!</strong>
            <p style="margin:.5rem 0 0;font-size:.9rem">Your message has been received. We will respond within 2–3 working days.</p>
          </div>`;
      }, 1000);
    });
  }

});
