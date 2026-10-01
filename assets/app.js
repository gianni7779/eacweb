/* EAC Technologies - animazioni, menu, modulo contatti */
(function () {
  'use strict';

  var CONTACT_EMAIL = 'infoelectronicascione@gmail.com';
  var CONTACT_PHONE = '339 174 9658';
  var WHATSAPP_NUMBER = '393391749658';

  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };

  // introduzione: barra di avvio, poi la schermata sale (solo alla prima visita)
  var loader = document.getElementById('loader');
  if (loader && root.classList.contains('intro')) {
    var bar = document.getElementById('loaderBar');
    var pct = document.getElementById('loaderPct');
    var txt = document.getElementById('loaderTxt');
    var start = performance.now();
    var step = function (now) {
      var t = Math.min(1, (now - start) / 950);
      var e = 1 - Math.pow(1 - t, 3);
      bar.style.transform = 'scaleX(' + e + ')';
      pct.textContent = Math.round(e * 100) + '%';
      if (t < 1) { requestAnimationFrame(step); return; }
      txt.textContent = 'Sistema attivo';
      setTimeout(function () { loader.classList.add('out'); }, 120);
      setTimeout(function () { loader.parentNode && loader.parentNode.removeChild(loader); }, 1300);
      try { sessionStorage.setItem('eac-intro', '1'); } catch (err) { /* navigazione privata */ }
    };
    requestAnimationFrame(step);
  }

  // barra in alto, avanzamento lettura, torna su, linea del metodo, voce attiva del menu
  var topbar = document.getElementById('topbar');
  var progress = document.getElementById('progress');
  var toTop = document.getElementById('toTop');
  var timeline = document.getElementById('timeline');
  var navLinks = document.querySelectorAll('.nav-links a');
  var navInd = document.getElementById('navInd');
  var spySections = [];
  each(navLinks, function (a) {
    var target = document.querySelector(a.getAttribute('href'));
    if (target) spySections.push({ link: a, section: target });
  });

  var setActive = function (link) {
    each(navLinks, function (a) { a.classList.toggle('active', a === link); });
    if (!navInd) return;
    if (!link) { navInd.style.opacity = '0'; return; }
    navInd.style.width = link.offsetWidth + 'px';
    navInd.style.transform = 'translateX(' + link.offsetLeft + 'px)';
    navInd.style.opacity = '1';
  };

  var updateTimeline = function () {
    var r = timeline.getBoundingClientRect();
    var line = window.innerHeight * 0.62;
    var p = Math.max(0, Math.min(1, (line - r.top) / r.height));
    timeline.style.setProperty('--p', p.toFixed(3));
    each(timeline.querySelectorAll('.t-step'), function (s) {
      s.classList.toggle('on', s.getBoundingClientRect().top + 22 < line);
    });
  };

  var ticking = false;
  var onScroll = function () {
    ticking = false;
    var y = window.pageYOffset || document.documentElement.scrollTop;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (topbar) topbar.classList.toggle('scrolled', y > 10 || topbar.classList.contains('solid'));
    if (progress) progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
    if (toTop) toTop.classList.toggle('show', y > window.innerHeight * 1.2);
    if (timeline) updateTimeline();
    if (spySections.length) {
      var mid = window.innerHeight * 0.35;
      var current = null;
      spySections.forEach(function (item) {
        var r = item.section.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) current = item.link;
      });
      setActive(current);
    }
  };
  var requestScroll = function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  };
  window.addEventListener('scroll', requestScroll, { passive: true });
  window.addEventListener('resize', requestScroll);
  onScroll();

  // menu a schermo intero (telefono e schermi stretti)
  var burger = document.getElementById('burger');
  var mnav = document.getElementById('mnav');
  if (burger && mnav) {
    var setMenu = function (open) {
      mnav.classList.toggle('open', open);
      mnav.setAttribute('aria-hidden', String(!open));
      if (open) mnav.removeAttribute('inert'); else mnav.setAttribute('inert', '');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu');
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', function () { setMenu(!mnav.classList.contains('open')); });
    mnav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && mnav.classList.contains('open')) {
        setMenu(false);
        burger.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1140 && mnav.classList.contains('open')) setMenu(false);
    });
  }

  // comparsa allo scorrimento (a gruppi di tre, leggermente sfalsati)
  each(document.querySelectorAll('[data-stagger]'), function (group) {
    each(group.querySelectorAll('[data-reveal]'), function (el, i) {
      el.style.setProperty('--rd', ((i % 3) * 0.09).toFixed(2) + 's');
    });
  });
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduced) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    each(revealEls, function (el) { revealObserver.observe(el); });
  } else {
    each(revealEls, function (el) { el.classList.add('in'); });
  }

  // pannelli dimostrativi: si animano solo quando sono sullo schermo
  var panels = document.querySelectorAll('.panel');
  if ('IntersectionObserver' in window) {
    var panelObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { entry.target.classList.toggle('live', entry.isIntersecting); });
    }, { threshold: 0.25 });
    each(panels, function (p) { panelObserver.observe(p); });
  } else {
    each(panels, function (p) { p.classList.add('live'); });
  }

  if (finePointer) {
    // luce che segue il mouse sulle schede
    each(document.querySelectorAll('.spot'), function (el) {
      el.addEventListener('pointermove', function (event) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (event.clientX - r.left) + 'px');
        el.style.setProperty('--my', (event.clientY - r.top) + 'px');
      });
    });
  }

  if (finePointer && !reduced) {
    // pulsanti "magnetici"
    each(document.querySelectorAll('.magnetic'), function (el) {
      el.addEventListener('pointermove', function (event) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--magx', ((event.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + 'px');
        el.style.setProperty('--magy', ((event.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px');
      });
      el.addEventListener('pointerleave', function () {
        el.style.setProperty('--magx', '0px');
        el.style.setProperty('--magy', '0px');
      });
    });

    // il pannello in alto si inclina seguendo il mouse
    var tilt = document.querySelector('.tilt');
    var hero = document.querySelector('.hero');
    if (tilt && hero) {
      hero.addEventListener('pointermove', function (event) {
        var r = tilt.getBoundingClientRect();
        var cx = (event.clientX - (r.left + r.width / 2)) / window.innerWidth;
        var cy = (event.clientY - (r.top + r.height / 2)) / window.innerHeight;
        tilt.style.setProperty('--ry', (cx * 12).toFixed(2) + 'deg');
        tilt.style.setProperty('--rx', (-cy * 10).toFixed(2) + 'deg');
      });
      hero.addEventListener('pointerleave', function () {
        tilt.style.setProperty('--rx', '0deg');
        tilt.style.setProperty('--ry', '0deg');
      });
    }
  }

  // rete animata dietro l'apertura: punti collegati che si muovono piano
  var canvas = document.getElementById('heroNet');
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var nodes = [];
    var W = 0;
    var H = 0;
    var running = false;
    var visible = true;
    var frame = 0;
    var pointer = { x: -9999, y: -9999 };
    var LINK = 150;

    var draw = function () {
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1;
      for (var i = 0; i < nodes.length; i++) {
        var a = nodes[i];
        for (var j = i + 1; j < nodes.length; j++) {
          var b = nodes[j];
          var dx = a.x - b.x;
          var dy = a.y - b.y;
          var d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            ctx.strokeStyle = 'rgba(45,212,255,' + ((1 - Math.sqrt(d2) / LINK) * 0.3).toFixed(3) + ')';
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        var px = a.x - pointer.x;
        var py = a.y - pointer.y;
        var pd = Math.sqrt(px * px + py * py);
        if (pd < 190) {
          ctx.strokeStyle = 'rgba(142,233,255,' + ((1 - pd / 190) * 0.55).toFixed(3) + ')';
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }
      }
      ctx.fillStyle = 'rgba(142,233,255,.85)';
      for (var k = 0; k < nodes.length; k++) {
        ctx.beginPath();
        ctx.arc(nodes[k].x, nodes[k].y, nodes[k].r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    var tick = function () {
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20) n.x = W + 20; else if (n.x > W + 20) n.x = -20;
        if (n.y < -20) n.y = H + 20; else if (n.y > H + 20) n.y = -20;
      }
      draw();
      frame = running ? requestAnimationFrame(tick) : 0;
    };

    var setRunning = function (on) {
      if (reduced) return;
      if (on && !running) { running = true; frame = requestAnimationFrame(tick); }
      else if (!on && running) { running = false; cancelAnimationFrame(frame); }
    };

    var resize = function () {
      var r = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var widthChanged = Math.abs(r.width - W) > 1;
      W = r.width;
      H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (widthChanged || !nodes.length) {
        var count = Math.max(18, Math.min(64, Math.round(W * H / 24000)));
        nodes = [];
        for (var i = 0; i < count; i++) {
          nodes.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35, r: Math.random() * 1.4 + 0.8 });
        }
      }
      draw();
    };

    resize();
    var resizeTimer = 0;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        setRunning(visible && !document.hidden);
      }).observe(canvas);
    } else {
      setRunning(true);
    }
    document.addEventListener('visibilitychange', function () { setRunning(visible && !document.hidden); });
    if (finePointer) {
      var heroArea = canvas.parentNode;
      heroArea.addEventListener('pointermove', function (event) {
        var r = canvas.getBoundingClientRect();
        pointer.x = event.clientX - r.left;
        pointer.y = event.clientY - r.top;
      });
      heroArea.addEventListener('pointerleave', function () { pointer.x = -9999; pointer.y = -9999; });
    }
  }

  // modulo contatti: online spedisce con invia.php; se non funziona (o se il sito
  // e' aperto sul PC) apre il programma di posta, cosi' la richiesta non si perde
  var form = document.getElementById('project-form');
  var status = document.getElementById('form-status');
  if (form && status) {
    var buttons = form.querySelectorAll('button[type="submit"]');

    var showStatus = function (text) {
      status.textContent = text;
      status.classList.add('visible');
      status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    var setBusy = function (busy) {
      each(buttons, function (b) { b.disabled = busy; });
      buttons[0].firstChild.textContent = busy ? 'Invio in corso… ' : 'Invia richiesta ';
    };

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;

      var data = new FormData(form);
      var value = function (name) { return String(data.get(name) || '').trim(); };
      var details = [
        ['Nome', value('nome')],
        ['Azienda', value('azienda')],
        ['Email', value('email')],
        ['Telefono', value('telefono')],
        ['Tipo di progetto', value('tipo')],
        ['Budget indicativo', value('budget')]
      ].filter(function (row) { return row[1]; })
        .map(function (row) { return row[0] + ': ' + row[1]; })
        .join('\n');
      var message = details + '\n\n' + value('descrizione');

      if (event.submitter && event.submitter.value === 'whatsapp') {
        window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent('Richiesta dal sito EAC\n\n' + message), '_blank', 'noopener');
        showStatus('Abbiamo aperto WhatsApp con la richiesta già scritta: premi Invia nella chat per completare.');
        return;
      }

      var openMail = function () {
        var subject = 'Richiesta dal sito - ' + value('tipo');
        window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(message);
        showStatus('Si apre il tuo programma di posta con la richiesta già scritta: premi Invia per completare. Se non si apre nulla, scrivici a ' + CONTACT_EMAIL + ' o chiama il ' + CONTACT_PHONE + '.');
      };

      setBusy(true);
      fetch('invia.php', { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(function (response) { return response.ok ? response.json() : { ok: false }; })
        .catch(function () { return { ok: false }; })
        .then(function (result) {
          setBusy(false);
          if (result && result.ok === true) {
            form.reset();
            showStatus('Richiesta inviata! Ti ricontatteremo al più presto.');
          } else {
            openMail();
          }
        });
    });
  }

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
