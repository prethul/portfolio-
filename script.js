(function () {
  /* ---------- Scroll progress bar ---------- */
  var progressBar = document.getElementById('scroll-progress');
  function updateProgress() {
    if (!progressBar) return;
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }
  document.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  /* ---------- Lightweight hero parallax ---------- */
  var heroVisual = document.querySelector('.hero-visual');
  var parallaxHero = document.querySelector('.hero-pro');
  if (heroVisual && parallaxHero && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var parallaxTicking = false;
    function updateParallax() {
      var offset = Math.min(window.scrollY * 0.06, 28);
      heroVisual.style.transform = 'translateY(' + offset + 'px)';
      parallaxTicking = false;
    }
    document.addEventListener('scroll', function () {
      if (!parallaxTicking) {
        window.requestAnimationFrame(updateParallax);
        parallaxTicking = true;
      }
    }, { passive: true });
  }

  /* ---------- Theme toggle (in-memory, no storage APIs) ---------- */
  var root = document.documentElement;
  var btn = document.getElementById('theme-toggle');

  function paintToggle() {
    var isDark = root.getAttribute('data-theme') === 'dark';
    if (btn) btn.textContent = isDark ? 'LIGHT' : 'DARK';
  }
  paintToggle();

  if (btn) {
    btn.addEventListener('click', function () {
      var isDark = root.getAttribute('data-theme') === 'dark';
      if (isDark) root.removeAttribute('data-theme');
      else root.setAttribute('data-theme', 'dark');
      paintToggle();
    });
  }

  /* ---------- Active nav link ---------- */
  var hereRaw = location.pathname.split('/').pop();
  var here = hereRaw && hereRaw.length ? hereRaw : 'index.html';
  document.querySelectorAll('nav.main-nav a').forEach(function (a) {
    var target = a.getAttribute('href');
    var targetPage = target ? target.split('#')[0] : '';
    var targetHash = target && target.indexOf('#') !== -1 ? target.split('#')[1] : '';
    if (targetPage === here && (!targetHash || targetHash === location.hash.slice(1))) a.classList.add('active');
  });

  /* ---------- Scroll reveal ---------- */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- Optional typewriter (home page hero) ---------- */
  var twEl = document.getElementById('typewriter');
  if (twEl) {
    var phrases = JSON.parse(twEl.getAttribute('data-phrases') || '[]');
    if (reduceMotion || phrases.length === 0) {
      twEl.textContent = phrases[0] || '';
    } else {
      var pi = 0, ci = 0, deleting = false;
      (function tick() {
        var word = phrases[pi];
        if (!deleting) {
          ci++;
          twEl.textContent = word.slice(0, ci);
          if (ci === word.length) { deleting = true; setTimeout(tick, 1400); return; }
        } else {
          ci--;
          twEl.textContent = word.slice(0, ci);
          if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
        }
        setTimeout(tick, deleting ? 32 : 58);
      })();
    }
  }

  /* ---------- Hero visual: glowing network graphic ---------- */
  var hv = document.getElementById('hv-svg');
  if (hv) {
    var W = 380, H = 380;
    var layers = [
      [{ x: 40, y: 90 }, { x: 30, y: 210 }, { x: 60, y: 320 }],
      [{ x: 170, y: 40 }, { x: 190, y: 150 }, { x: 175, y: 260 }, { x: 200, y: 350 }],
      [{ x: 320, y: 110 }, { x: 330, y: 230 }, { x: 300, y: 330 }]
    ];
    var edgesG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    var nodesG = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    for (var l = 0; l < layers.length - 1; l++) {
      layers[l].forEach(function (a) {
        layers[l + 1].forEach(function (b) {
          if (Math.random() > 0.35) {
            var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
            line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
            line.setAttribute('class', 'hv-line');
            edgesG.appendChild(line);
          }
        });
      });
    }

    layers.forEach(function (layer, li) {
      layer.forEach(function (p, i) {
        var c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('cx', p.x); c.setAttribute('cy', p.y);
        c.setAttribute('r', li === 1 ? 6 : 4.5);
        c.setAttribute('class', 'hv-node' + (li === 1 && i % 2 === 0 ? ' big' : ''));
        if (!reduceMotion) {
          c.classList.add('hv-float');
          c.style.animationDelay = (li * 0.4 + i * 0.3) + 's';
        }
        nodesG.appendChild(c);
      });
    });

    hv.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    hv.appendChild(edgesG);
    hv.appendChild(nodesG);
  }

  /* ---------- Boot loader (terminal-style intro, once per session) ---------- */
  var boot = document.getElementById('boot-loader');
  if (boot) {
    var alreadyBooted = false;
    try { alreadyBooted = sessionStorage.getItem('prethul-booted') === '1'; } catch (e) {}

    if (reduceMotion || alreadyBooted) {
      boot.remove();
    } else {
      var lines = boot.querySelectorAll('.boot-lines div');
      lines.forEach(function (line, i) {
        line.style.animationDelay = (i * 0.28) + 's';
      });
      var totalDelay = lines.length * 280 + 500;
      setTimeout(function () {
        boot.classList.add('hide');
        setTimeout(function () { boot.remove(); }, 420);
      }, totalDelay);
      try { sessionStorage.setItem('prethul-booted', '1'); } catch (e) {}
    }
  }

  /* ---------- Cursor glow (fine pointer devices only) ---------- */
  var glow = document.getElementById('cursor-glow');
  var hasFinePointer = window.matchMedia('(pointer: fine)').matches;
  if (glow && hasFinePointer && !reduceMotion) {
    var glowActive = false;
    document.addEventListener('mousemove', function (e) {
      glow.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
      if (!glowActive) { glow.classList.add('active'); glowActive = true; }
    });
    document.addEventListener('mouseleave', function () { glow.classList.remove('active'); });
  } else if (glow) {
    glow.remove();
  }

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById('nav-toggle');
  var mainNav = document.querySelector('nav.main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    mainNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Command palette ---------- */
  var cmdkOverlay = document.getElementById('cmdk-overlay');
  var cmdkInput = document.getElementById('cmdk-input');
  var cmdkList = document.getElementById('cmdk-list');
  var cmdkTrigger = document.getElementById('cmdk-trigger');

  if (cmdkOverlay && cmdkInput && cmdkList) {
    var commands = [
      { label: 'Go to Home', tag: 'page', run: function () { location.href = 'index.html'; } },
      { label: 'Go to About', tag: 'page', run: function () { location.href = 'about.html'; } },
      { label: 'Go to Projects', tag: 'page', run: function () { location.href = 'projects.html'; } },
      { label: 'Go to Resume', tag: 'page', run: function () { location.href = 'resume.html'; } },
      { label: 'Go to Contact', tag: 'page', run: function () { location.href = 'contact.html'; } },
      { label: 'Toggle dark / light theme', tag: 'action', run: function () { if (btn) btn.click(); } },
      { label: 'Open GitHub', tag: 'link', run: function () { window.open('https://github.com/prethul', '_blank', 'noopener'); } },
      { label: 'Open LinkedIn', tag: 'link', run: function () { window.open('https://www.linkedin.com/in/dipto-howlader-prethul-603808333/', '_blank', 'noopener'); } },
      { label: 'Message Prethul on LinkedIn', tag: 'link', run: function () { window.open('https://www.linkedin.com/in/dipto-howlader-prethul-603808333/', '_blank', 'noopener'); } }
    ];

    var activeIndex = 0;
    var filtered = commands.slice();

    function renderList() {
      cmdkList.innerHTML = '';
      if (filtered.length === 0) {
        var empty = document.createElement('li');
        empty.className = 'empty';
        empty.textContent = 'No matching commands';
        cmdkList.appendChild(empty);
        return;
      }
      filtered.forEach(function (cmd, i) {
        var li = document.createElement('li');
        li.textContent = cmd.label;
        var tagSpan = document.createElement('span');
        tagSpan.className = 'tag';
        tagSpan.textContent = cmd.tag;
        li.appendChild(tagSpan);
        if (i === activeIndex) li.classList.add('active');
        li.addEventListener('mouseenter', function () { activeIndex = i; renderList(); });
        li.addEventListener('click', function () { execute(cmd); });
        cmdkList.appendChild(li);
      });
    }

    function execute(cmd) {
      closeCmdk();
      if (cmd) cmd.run();
    }

    function openCmdk() {
      cmdkOverlay.classList.add('open');
      cmdkInput.value = '';
      filtered = commands.slice();
      activeIndex = 0;
      renderList();
      setTimeout(function () { cmdkInput.focus(); }, 30);
    }

    function closeCmdk() {
      cmdkOverlay.classList.remove('open');
    }

    cmdkInput.addEventListener('input', function () {
      var q = cmdkInput.value.trim().toLowerCase();
      filtered = commands.filter(function (c) { return c.label.toLowerCase().indexOf(q) !== -1; });
      activeIndex = 0;
      renderList();
    });

    cmdkInput.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex = Math.min(activeIndex + 1, filtered.length - 1);
        renderList();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex = Math.max(activeIndex - 1, 0);
        renderList();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        execute(filtered[activeIndex]);
      } else if (e.key === 'Escape') {
        closeCmdk();
      }
    });

    cmdkOverlay.addEventListener('click', function (e) {
      if (e.target === cmdkOverlay) closeCmdk();
    });

    if (cmdkTrigger) cmdkTrigger.addEventListener('click', openCmdk);

    document.addEventListener('keydown', function (e) {
      var isK = e.key === 'k' || e.key === 'K';
      if ((e.metaKey || e.ctrlKey) && isK) {
        e.preventDefault();
        cmdkOverlay.classList.contains('open') ? closeCmdk() : openCmdk();
      }
    });
  }

  /* ---------- Skill bars (about page) ---------- */
  var skillFills = document.querySelectorAll('.skill-fill');
  if (skillFills.length) {
    if ('IntersectionObserver' in window && !reduceMotion) {
      var skillIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('filled');
            skillIo.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      skillFills.forEach(function (el) { skillIo.observe(el); });
    } else {
      skillFills.forEach(function (el) { el.classList.add('filled'); });
    }
  }

  /* ---------- Count-up stats (home page) ---------- */
  var countEls = document.querySelectorAll('[data-count]');
  if (countEls.length) {
    function animateCount(el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      if (reduceMotion) { el.textContent = target + suffix; return; }
      var start = null;
      var duration = 900;
      function step(ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if ('IntersectionObserver' in window) {
      var countIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countIo.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });
      countEls.forEach(function (el) { countIo.observe(el); });
    } else {
      countEls.forEach(animateCount);
    }
  }

  /* ---------- Contact form ---------- */
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    var statusEl = document.getElementById('form-status');
    var submitBtn = contactForm.querySelector('.form-submit');
    // Keep the form honest until a real production webhook is configured.
    var WEBHOOK_URL = 'https://YOUR-N8N-INSTANCE/webhook/contact-form';

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = contactForm.elements.name.value.trim();
      var email = contactForm.elements.email.value.trim();
      var message = contactForm.elements.message.value.trim();

      if (!name || !email || !message) {
        statusEl.textContent = 'Please fill in every field.';
        statusEl.className = 'form-status err';
        return;
      }

      if (!/^\S+@\S+\.\S+$/.test(email)) {
        statusEl.textContent = 'Please enter a valid email address.';
        statusEl.className = 'form-status err';
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
      statusEl.textContent = '';
      statusEl.className = 'form-status';

      if (WEBHOOK_URL.indexOf('YOUR-N8N-INSTANCE') !== -1) {
        statusEl.textContent = 'Direct form delivery is not configured yet. Please message me on LinkedIn instead.';
        statusEl.className = 'form-status err';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
        return;
      }

      fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, email: email, message: message, source: 'portfolio-contact-form' })
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Request failed');
          statusEl.textContent = 'Message sent — thanks! I\'ll get back to you soon.';
          statusEl.className = 'form-status ok';
          contactForm.reset();
        })
        .catch(function () {
          statusEl.textContent = 'Something went wrong. Please email me directly instead.';
          statusEl.className = 'form-status err';
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Message';
        });
    });
  }
})();
