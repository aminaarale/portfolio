/* =========================================================
   Amina Arale — portfolio behaviour
   Plain JavaScript, no dependencies.
   ========================================================= */
(function () {
  'use strict';

  /* ---------- 1. Mobile navigation ---------- */
  var navToggle = document.getElementById('navtoggle');
  var nav = document.getElementById('nav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });

    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- 2. Scroll progress bar + current section ---------- */
  var progress = document.getElementById('progress');
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a'));
  var ticking = false;

  function onScroll() {
    // progress bar
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
    if (progress) progress.style.width = pct + '%';

    // which section are we in
    var marker = window.scrollY + 120;
    var currentId = sections.length ? sections[0].id : null;

    sections.forEach(function (section) {
      if (section.offsetTop <= marker) currentId = section.id;
    });

    navLinks.forEach(function (link) {
      link.classList.toggle('is-current', link.getAttribute('href') === '#' + currentId);
    });

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  /* ---------- 3. Project filtering ---------- */
  var filters = Array.prototype.slice.call(document.querySelectorAll('.filter'));
  var projects = Array.prototype.slice.call(document.querySelectorAll('.project'));
  var emptyNote = document.getElementById('projects-empty');

  filters.forEach(function (button) {
    button.addEventListener('click', function () {
      var wanted = button.dataset.filter;
      var shown = 0;

      filters.forEach(function (b) { b.classList.toggle('is-active', b === button); });

      projects.forEach(function (card) {
        var match = wanted === 'all' || card.dataset.type === wanted;
        card.hidden = !match;
        if (match) shown++;
      });

      if (emptyNote) emptyNote.hidden = shown !== 0;
    });
  });

  /* ---------- 4. Lab challenge accordion ---------- */
  var labHeads = Array.prototype.slice.call(document.querySelectorAll('.lab__head'));
  var expandAll = document.getElementById('expand-all');

  function setLab(head, open) {
    var panel = document.getElementById(head.getAttribute('aria-controls'));
    head.setAttribute('aria-expanded', String(open));
    if (panel) panel.hidden = !open;
  }

  labHeads.forEach(function (head) {
    head.addEventListener('click', function () {
      var isOpen = head.getAttribute('aria-expanded') === 'true';
      setLab(head, !isOpen);
      syncExpandAll();
    });
  });

  function syncExpandAll() {
    if (!expandAll) return;
    var allOpen = labHeads.length > 0 && labHeads.every(function (h) {
      return h.getAttribute('aria-expanded') === 'true';
    });
    expandAll.setAttribute('aria-expanded', String(allOpen));
    expandAll.textContent = allOpen ? 'Collapse all' : 'Expand all';
  }

  if (expandAll) {
    expandAll.addEventListener('click', function () {
      var open = expandAll.getAttribute('aria-expanded') !== 'true';
      labHeads.forEach(function (head) { setLab(head, open); });
      syncExpandAll();
    });
  }

  // keep the writeup count honest even if entries are added or removed
  var labCount = document.getElementById('lab-count');
  if (labCount) labCount.textContent = String(labHeads.length);

  /* ---------- 5. Open a writeup directly from a #lab-n link ---------- */
  function openFromHash() {
    var id = window.location.hash.replace('#', '');
    if (!id) return;
    var head = document.querySelector('[aria-controls="' + id + '"]');
    if (head) {
      setLab(head, true);
      syncExpandAll();
      head.scrollIntoView({ block: 'center' });
    }
  }
  window.addEventListener('hashchange', openFromHash);
  openFromHash();

  /* ---------- 6. Copy to clipboard ---------- */
  Array.prototype.slice.call(document.querySelectorAll('.copy')).forEach(function (button) {
    button.addEventListener('click', function () {
      var value = button.dataset.copy || '';
      var original = button.textContent;

      function done(message) {
        button.textContent = message;
        window.setTimeout(function () { button.textContent = original; }, 1600);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(function () { done('Copied'); },
                                                  function () { done('Press Ctrl+C'); });
      } else {
        done('Press Ctrl+C');
      }
    });
  });

  /* ---------- 7. Download CV (print stylesheet) ---------- */
  var printCv = document.getElementById('printcv');
  if (printCv) {
    printCv.addEventListener('click', function () { window.print(); });
  }

  /* ---------- 8. Contact form ---------- */
  var form = document.getElementById('contact-form');
  var status = document.getElementById('contact-status');
  var EMAIL_TO = 'amina.arale@example.com';

  function showError(input, show) {
    var field = input.closest('.field');
    var error = document.querySelector('[data-error-for="' + input.id + '"]');
    if (field) field.classList.toggle('is-invalid', show);
    if (error) error.hidden = !show;
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = document.getElementById('cf-name');
      var email = document.getElementById('cf-email');
      var message = document.getElementById('cf-message');
      var valid = true;

      [name, email, message].forEach(function (input) {
        var bad = input.value.trim() === '' ||
                  (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim()));
        showError(input, bad);
        if (bad) valid = false;
      });

      if (!valid) {
        if (status) status.textContent = 'Fix the highlighted fields and send again.';
        return;
      }

      var subject = 'Portfolio enquiry from ' + name.value.trim();
      var body = message.value.trim() + '\n\n' + name.value.trim() + '\n' + email.value.trim();

      window.location.href = 'mailto:' + EMAIL_TO +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);

      if (status) status.textContent = 'Opening your mail client with the message ready to send.';
      form.reset();
    });

    form.addEventListener('input', function (e) {
      if (e.target.matches('input, textarea')) showError(e.target, false);
    });
  }

})();
