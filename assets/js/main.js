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
    const DWELL  = 11000; // ms per clip — longer dwell, less frequent cuts
    const FADE   = 2200;  // ms — must match CSS transition duration

    function goTo(idx) {
      const prev = current;
      current = ((idx % clips.length) + clips.length) % clips.length;
      if (prev === current) return;

      // Outgoing clip: keep on top (z-index:2) and fade it out
      clips[prev].classList.remove('active');
      clips[prev].classList.add('leaving');
      if (dots[prev]) {
        dots[prev].classList.remove('active');
        dots[prev].setAttribute('aria-pressed', 'false');
      }

      // Incoming clip: place beneath (z-index:1) and fade in
      clips[current].classList.add('active');
      if (dots[current]) {
        dots[current].classList.add('active');
        dots[current].setAttribute('aria-pressed', 'true');
      }

      // Play incoming video from beginning
      const vid = clips[current].querySelector('video');
      if (vid) { vid.currentTime = 0; vid.play().catch(() => {}); }

      // Clean up leaving class once the cross-dissolve finishes
      const leaving = clips[prev];
      setTimeout(function () {
        leaving.classList.remove('leaving');
      }, FADE + 100);
    }

    // Start cycling
    function startCycle() {
      clearInterval(timer);
      timer = setInterval(() => goTo(current + 1), DWELL);
    }

    // Dot buttons — click (mouse & keyboard Enter/Space via native button behaviour)
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        goTo(i);
        startCycle(); // reset interval on manual nav
      });
    });

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
    if (isNaN(target)) return; // guard against bad data-count attribute
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

  /* --- Contact Form — Netlify Forms submission ------------------ */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('[type="submit"]');
      btn.textContent = 'Sending…';
      btn.disabled = true;

      // Encode all named form fields for Netlify
      const encode = (data) =>
        Object.keys(data)
          .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(data[k]))
          .join('&');

      const formData = {
        'form-name': 'contact',
        firstName:    contactForm.querySelector('[name="firstName"]').value,
        lastName:     contactForm.querySelector('[name="lastName"]').value,
        email:        contactForm.querySelector('[name="email"]').value,
        phone:        contactForm.querySelector('[name="phone"]').value,
        organisation: contactForm.querySelector('[name="organisation"]').value,
        subject:      contactForm.querySelector('[name="subject"]').value,
        message:      contactForm.querySelector('[name="message"]').value,
      };

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode(formData),
      })
        .then(() => {
          // Success — show confirmation inline
          contactForm.innerHTML = `
            <div class="mph-notice mph-notice--teal" style="justify-content:center;text-align:center;padding:2.5rem;flex-direction:column;">
              <div style="font-size:2.5rem;margin-bottom:.75rem;">✅</div>
              <strong>Thank you for reaching out!</strong>
              <p style="margin:.5rem 0 0;font-size:.9rem">Your message has been received. We will respond within 2–3 working days.</p>
            </div>`;
        })
        .catch(() => {
          // Network error — restore button so user can retry
          btn.textContent = 'Send Message';
          btn.disabled = false;
          const err = document.createElement('p');
          err.style.cssText = 'color:#e53e3e;font-size:.85rem;margin-top:.75rem;text-align:center';
          err.textContent = 'Something went wrong. Please try again or email us directly at info@migrationpulsehub.org';
          contactForm.appendChild(err);
        });
    });
  }

});
