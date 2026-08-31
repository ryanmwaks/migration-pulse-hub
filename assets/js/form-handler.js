/**
 * MPH Dual Form Handler v1.2
 * ─────────────────────────────────────────────────────────────────
 * Fires every form submission to TWO email services simultaneously:
 *   1. Web3Forms  — https://web3forms.com        (primary)
 *   2. EmailJS    — https://www.emailjs.com       (backup)
 *
 * Delivery succeeds if AT LEAST ONE service responds OK.
 * ALL forms deliver to: info@migrationpulsehub.org
 *
 * ── WEB3FORMS KEYS (active) ─────────────────────────────────────
 *   Contact & Newsletter forms  → W3F_KEY_CONTACT
 *   Refugee Week forms          → W3F_KEY_RW
 *
 * ── EMAILJS SETUP (free — 200 emails/month) ─────────────────────
 *   1. Sign up at https://www.emailjs.com
 *   2. Add an Email Service (Gmail / Outlook) → copy the Service ID
 *   3. Create an Email Template:
 *        Subject : {{form_subject}}
 *        Body    : {{message}}
 *        From Name: {{from_name}}   Reply-To: {{email}}
 *      Copy the Template ID
 *   4. Account → copy your Public Key
 *   5. Replace the three placeholder values below
 *
 * ─────────────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  /* ── CONFIGURATION ──────────────────────────────────────────── */
  /* Web3Forms — two forms, two keys (both route to info@migrationpulsehub.org) */
  var W3F_KEY_CONTACT = '2c82465e-2bb6-4679-b096-d3e48a542db5';  // contact form + newsletter
  var W3F_KEY_RW      = '660dd4c7-c68e-4499-8698-a56f9bb244ca';  // refugee week all forms

  /* EmailJS — fill in once you've set it up */
  var EJS_SERVICE  = 'YOUR_EMAILJS_SERVICE_ID';      // emailjs.com
  var EJS_TEMPLATE = 'YOUR_EMAILJS_TEMPLATE_ID';     // emailjs.com
  var EJS_PUBKEY   = 'YOUR_EMAILJS_PUBLIC_KEY';      // emailjs.com

  var TO_EMAIL = 'info@migrationpulsehub.org';
  /* ─────────────────────────────────────────────────────────── */

  /* Initialise EmailJS once the SDK is loaded */
  function initEJS() {
    if (typeof emailjs !== 'undefined' && EJS_PUBKEY !== 'YOUR_EMAILJS_PUBLIC_KEY') {
      try { emailjs.init(EJS_PUBKEY); } catch (e) { /* already initialised */ }
    }
  }
  initEJS();
  document.addEventListener('DOMContentLoaded', initEJS);

  /* ── Helpers ────────────────────────────────────────────────── */

  /** Build a readable summary string from a FormData object */
  function buildMessage(fd, subject) {
    var lines = ['Form: ' + subject, ''];
    fd.forEach(function (v, k) {
      if (k.charAt(0) === '_' || k === 'access_key' || !v.toString().trim()) return;
      var label = k.replace(/_/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
      lines.push(label + ': ' + v);
    });
    lines.push('', '--- migrationpulsehub.org ---');
    return lines.join('\n');
  }

  /** Extract the sender's name from FormData (common field names) */
  function getSenderName(fd) {
    return fd.get('full_name') || fd.get('firstName') || fd.get('name') || 'Website Visitor';
  }

  /* ── Web3Forms submission ───────────────────────────────────── */
  function submitW3F(form, subject, w3fKey) {
    var key = w3fKey || W3F_KEY_CONTACT;
    var data = new FormData(form);
    data.set('access_key', key);
    data.set('subject', subject);
    data.set('from_name', getSenderName(data) + ' via MPH Website');
    data.delete('_honey');
    return fetch('https://api.web3forms.com/submit', {
      method: 'POST', body: data,
      headers: { Accept: 'application/json' }
    })
    .then(function (r) { return r.json(); })
    .then(function (d) { return d.success === true || d.success === 'true'; })
    .catch(function () { return false; });
  }

  /* ── EmailJS submission ─────────────────────────────────────── */
  function submitEJS(form, subject) {
    if (typeof emailjs === 'undefined' || EJS_SERVICE === 'YOUR_EMAILJS_SERVICE_ID') {
      return Promise.resolve(false);
    }
    var fd = new FormData(form);
    var params = {
      form_subject : subject,
      to_email     : TO_EMAIL,
      from_name    : getSenderName(fd),
      email        : fd.get('email') || '',
      message      : buildMessage(fd, subject)
    };
    return emailjs.send(EJS_SERVICE, EJS_TEMPLATE, params)
      .then(function () { return true; })
      .catch(function () { return false; });
  }

  /* ── Main public handler ────────────────────────────────────── */
  /**
   * mphSubmit(event, opts)
   *
   * opts = {
   *   subject   : string   — email subject line
   *   successId : string   — id of the success message element to show
   *   w3fKey    : string   — Web3Forms access key (omit to use contact key)
   *   whatsapp  : string   — if set, opens a WhatsApp follow-up for this form type
   *   redirect  : string   — optional URL to redirect to on success
   * }
   */
  window.mphSubmit = function (e, opts) {
    e.preventDefault();
    opts = opts || {};

    var form    = e.target;
    var btn     = form.querySelector('[type=submit]');
    var origTxt = btn ? btn.textContent : 'Submit';

    /* Honeypot — bail silently if a bot filled the hidden field */
    var honey = form.querySelector('[name="_honey"]');
    if (honey && honey.value.trim()) return;

    var subject = opts.subject
      || (form.querySelector('[name="_subject"]') || {}).value
      || 'New Form Submission — Migration Pulse Hub';

    /* UI: loading state */
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

    /* Fire both submissions in parallel */
    Promise.all([submitW3F(form, subject, opts.w3fKey), submitEJS(form, subject)])
      .then(function (results) {
        var ok = results[0] || results[1];

        if (ok) {
          /* Success */
          if (btn) btn.textContent = '✓ Sent!';

          var el = opts.successId ? document.getElementById(opts.successId) : null;
          if (el) {
            el.style.display = 'block';
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }

          form.reset();

          /* WhatsApp follow-up for refugee-week registrations */
          if (opts.whatsapp) {
            var msg = encodeURIComponent(
              'Hello Migration Pulse Hub, I have just submitted a ' +
              opts.whatsapp + ' form on your website. Please confirm receipt.'
            );
            window.open('https://api.whatsapp.com/send?phone=254118969209&text=' + msg, '_blank', 'noopener,noreferrer');
          }

          if (opts.redirect) {
            setTimeout(function () { window.location.href = opts.redirect; }, 1800);
          }

        } else {
          /* Both failed */
          if (btn) { btn.disabled = false; btn.textContent = origTxt; }
          alert('Submission failed. Please try again or reach us directly:\n\nEmail: info@migrationpulsehub.org\nPhone: +254 118 969 209\nWhatsApp: +254 118 969 209');
        }
      });
  };

})();
