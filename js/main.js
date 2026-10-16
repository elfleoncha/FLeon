/* ==========================================================================
   Portafolio — main.js
   Tema · scrollspy · progreso · contadores · filtros · typewriter · copiar email
   · scroll suave (Lenis) · parallax · cursor custom · tilt 3D en tarjetas
   ========================================================================== */
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia && window.matchMedia("(pointer: fine)").matches;

  /* ---------- Año dinámico ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Tema claro / oscuro ---------- */
  var root = document.documentElement;
  var themeToggle = document.getElementById("themeToggle");
  var stored = null;
  try { stored = localStorage.getItem("theme"); } catch (e) {}
  var prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
  var theme = stored || (prefersLight ? "light" : "dark");

  function applyTheme(t) {
    root.setAttribute("data-theme", t);
    if (themeToggle) themeToggle.textContent = t === "dark" ? "🌙" : "☀️";
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "dark" ? "#0b0f14" : "#f7f9fc");
  }
  applyTheme(theme);
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      theme = theme === "dark" ? "light" : "dark";
      applyTheme(theme);
      try { localStorage.setItem("theme", theme); } catch (e) {}
    });
  }

  /* ---------- Scroll suave (Lenis, si está disponible) ---------- */
  var lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new window.Lenis({ duration: 1.1, smoothWheel: true, wheelMultiplier: 0.95 });
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
  }
  function scrollToTarget(el, offset) {
    if (lenis) { lenis.scrollTo(el, { offset: offset || -70 }); }
    else { var y = (el === 0 ? 0 : el.getBoundingClientRect().top + window.scrollY + (offset || -70)); window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" }); }
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var href = a.getAttribute("href");
      if (href === "#top" || href === "#") { e.preventDefault(); scrollToTarget(0, 0); return; }
      var t = document.querySelector(href);
      if (t) { e.preventDefault(); scrollToTarget(t, -70); }
    });
  });

  /* ---------- Nav: borde + progreso ---------- */
  var nav = document.getElementById("nav");
  var progress = document.getElementById("navProgress");
  function onScroll() {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 8);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Menú móvil ---------- */
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Scrollspy ---------- */
  var navAnchors = links ? Array.prototype.slice.call(links.querySelectorAll("a")) : [];
  var sections = navAnchors.map(function (a) { return document.querySelector(a.getAttribute("href")); }).filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navAnchors.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id); });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealTargets = document.querySelectorAll(".card, .section__title, .about__text p, .about__facts li, .method, .hero__stats li");
  revealTargets.forEach(function (el) { el.classList.add("reveal"); });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Contadores ---------- */
  var counters = document.querySelectorAll("#stats strong[data-count]");
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1300, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (counters.length && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animateCount(entry.target); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- Filtros de proyectos ---------- */
  var filterWrap = document.getElementById("filters");
  var projects = document.querySelectorAll("#projects .card--project");
  var empty = document.getElementById("filtersEmpty");
  if (filterWrap && projects.length) {
    filterWrap.addEventListener("click", function (e) {
      var btn = e.target.closest(".chip");
      if (!btn) return;
      var f = btn.getAttribute("data-filter");
      filterWrap.querySelectorAll(".chip").forEach(function (c) { c.classList.toggle("is-active", c === btn); });
      var shown = 0;
      projects.forEach(function (card) {
        var match = f === "all" || card.getAttribute("data-cat") === f;
        card.classList.toggle("is-hidden", !match);
        if (match) shown++;
      });
      if (empty) empty.hidden = shown !== 0;
    });
  }

  /* ---------- Typewriter ---------- */
  var typeEl = document.getElementById("typewriter");
  if (typeEl) {
    var words = (typeEl.getAttribute("data-words") || "").split("|").filter(Boolean);
    if (reduce || !words.length) {
      typeEl.textContent = words[0] || "";
    } else {
      var wi = 0, ci = 0, deleting = false;
      (function tick() {
        var word = words[wi];
        typeEl.textContent = word.slice(0, ci);
        if (!deleting && ci < word.length) { ci++; setTimeout(tick, 55); }
        else if (!deleting && ci === word.length) { deleting = true; setTimeout(tick, 1600); }
        else if (deleting && ci > 0) { ci--; setTimeout(tick, 28); }
        else { deleting = false; wi = (wi + 1) % words.length; setTimeout(tick, 300); }
      })();
    }
  }

  /* ---------- Copiar email ---------- */
  var copyBtn = document.getElementById("copyEmail");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var email = copyBtn.getAttribute("data-email");
      var done = function () {
        var prev = copyBtn.textContent;
        copyBtn.textContent = "✅ ¡Copiado!";
        copyBtn.classList.add("is-done");
        setTimeout(function () { copyBtn.textContent = prev; copyBtn.classList.remove("is-done"); }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done).catch(function () {});
      } else {
        var t = document.createElement("textarea");
        t.value = email; document.body.appendChild(t); t.select();
        try { document.execCommand("copy"); done(); } catch (e) {}
        document.body.removeChild(t);
      }
    });
  }

  /* ---------- Cursor custom ---------- */
  var cursor = document.getElementById("cursor");
  var cursorDot = document.getElementById("cursorDot");
  var hoverSel = "a, button, .chip, .card, .icon-btn";
  if (cursor && cursorDot && finePointer && !reduce) {
    document.body.classList.add("has-cursor");
    var cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    var mxp = cx, myp = cy;
    window.addEventListener("pointermove", function (e) {
      mxp = e.clientX; myp = e.clientY;
      cursorDot.style.transform = "translate3d(" + mxp + "px," + myp + "px,0) translate(-50%,-50%)";
      var hit = e.target.closest ? e.target.closest(hoverSel) : null;
      cursor.classList.toggle("is-hover", !!hit);
    }, { passive: true });
    (function follow() {
      cx += (mxp - cx) * 0.18;
      cy += (myp - cy) * 0.18;
      cursor.style.transform = "translate3d(" + cx + "px," + cy + "px,0) translate(-50%,-50%)";
      requestAnimationFrame(follow);
    })();
  }

  /* ---------- Tilt 3D en tarjetas de proyecto ---------- */
  if (finePointer && !reduce) {
    document.querySelectorAll(".card--project").forEach(function (card) {
      card.classList.add("tilt");
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "perspective(820px) rotateY(" + (px * 9) + "deg) rotateX(" + (-py * 9) + "deg) translateY(-4px)";
      });
      card.addEventListener("pointerleave", function () { card.style.transform = ""; });
    });
  }

  /* ---------- Parallax por capas ---------- */
  var pxEls = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
  var heroInner = document.querySelector("[data-parallax-hero]");
  if (!reduce && (pxEls.length || heroInner)) {
    (function parallax() {
      var y = window.scrollY;
      pxEls.forEach(function (el) {
        var s = parseFloat(el.getAttribute("data-parallax")) || 0;
        el.style.transform = "translate3d(0," + (y * s).toFixed(1) + "px,0)";
      });
      if (heroInner) {
        heroInner.style.transform = "translate3d(0," + (y * 0.18).toFixed(1) + "px,0)";
        heroInner.style.opacity = Math.max(0, 1 - y / 640).toFixed(3);
      }
      requestAnimationFrame(parallax);
    })();
  }
})();
