/* ==========================================================================
   FLEONCHA.DEV — app.js
   Preloader · Lenis + GSAP ScrollTrigger · reveals · work horizontal · magnético · cursor
   ========================================================================== */
(function () {
  "use strict";

  var html = document.documentElement;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = matchMedia("(pointer: fine)").matches;
  var hasGsap = !!window.gsap;

  if (!hasGsap) html.classList.add("no-anim");

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Tema día / noche ---------- */
  var themeToggle = document.getElementById("themeToggle");
  var themeIcon = document.getElementById("themeIcon");
  var savedTheme = null;
  try { savedTheme = localStorage.getItem("theme"); } catch (e) {}
  var theme = savedTheme || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    if (themeIcon) themeIcon.textContent = t === "dark" ? "🌙" : "☀️";
    if (themeToggle) themeToggle.setAttribute("aria-pressed", String(t === "light"));
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "dark" ? "#08080c" : "#ffffff");
    window.dispatchEvent(new CustomEvent("themechange", { detail: { theme: t } }));
  }
  applyTheme(theme);
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      theme = theme === "dark" ? "light" : "dark";
      applyTheme(theme);
      try { localStorage.setItem("theme", theme); } catch (e) {}
    });
  }

  /* ---------- Duplicar marquees para loop continuo ---------- */
  document.querySelectorAll(".marquee__track, .row__track").forEach(function (t) {
    t.innerHTML += t.innerHTML;
  });

  /* ---------- Lenis + ScrollTrigger ---------- */
  var lenis = null;
  if (hasGsap) {
    gsap.registerPlugin(window.ScrollTrigger);
    if (window.Lenis) {
      lenis = new window.Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 1 });
      lenis.on("scroll", window.ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
  }
  function scrollToEl(target, offset) {
    offset = offset == null ? -70 : offset;
    if (lenis) { lenis.scrollTo(target, { offset: offset }); return; }
    var y = target === 0 ? 0 : target.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
  }
  document.querySelectorAll("[data-nav]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      var href = a.getAttribute("href");
      if (!href || href.charAt(0) !== "#") return;
      var t = document.querySelector(href);
      if (t) { e.preventDefault(); scrollToEl(t, -70); }
    });
  });

  /* ---------- Menú móvil ---------- */
  var burger = document.getElementById("burger");
  var navLinks = document.querySelector(".nav__links");
  if (burger && navLinks) {
    burger.addEventListener("click", function () { navLinks.classList.toggle("is-open"); });
    navLinks.addEventListener("click", function (e) { if (e.target.tagName === "A") navLinks.classList.remove("is-open"); });
  }

  /* ---------- Cursor custom ---------- */
  var cursor = document.getElementById("cursor");
  var cursorDot = document.getElementById("cursorDot");
  if (cursor && cursorDot && fine) {
    document.body.classList.add("cursor-on");
    var cx = innerWidth / 2, cy = innerHeight / 2, mx = cx, my = cy;
    window.addEventListener("pointermove", function (e) {
      mx = e.clientX; my = e.clientY;
      cursorDot.style.transform = "translate3d(" + mx + "px," + my + "px,0) translate(-50%,-50%)";
      var hit = e.target.closest && e.target.closest("a, button, .proj, .nav__cta");
      cursor.classList.toggle("is-hover", !!hit);
    }, { passive: true });
    (function follow() {
      cx += (mx - cx) * 0.18; cy += (my - cy) * 0.18;
      cursor.style.transform = "translate3d(" + cx + "px," + cy + "px,0) translate(-50%,-50%)";
      requestAnimationFrame(follow);
    })();
  }

  /* ---------- Typewriter ---------- */
  var typeEl = document.getElementById("typewriter");
  if (typeEl) {
    var words = (typeEl.getAttribute("data-words") || "").split("|").filter(Boolean);
    if (!words.length) { typeEl.textContent = words[0] || ""; }
    else {
      var wi = 0, ci = 0, del = false;
      (function tick() {
        var w = words[wi];
        typeEl.textContent = w.slice(0, ci);
        if (!del && ci < w.length) { ci++; setTimeout(tick, 58); }
        else if (!del && ci === w.length) { del = true; setTimeout(tick, 1500); }
        else if (del && ci > 0) { ci--; setTimeout(tick, 26); }
        else { del = false; wi = (wi + 1) % words.length; setTimeout(tick, 260); }
      })();
    }
  }

  /* ---------- Contadores ---------- */
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1400, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll("#stats strong[data-count]");
  if (counters.length) {
    if ("IntersectionObserver" in window) {
      var cio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); } });
      }, { threshold: 0.5 });
      counters.forEach(function (c) { cio.observe(c); });
    } else counters.forEach(countUp);
  }

  /* ---------- Split words (para reveal por palabra) ---------- */
  function splitWords(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (node) {
      var parts = node.nodeValue.split(/(\s+)/);
      var frag = document.createDocumentFragment();
      parts.forEach(function (p) {
        if (p.trim() === "") frag.appendChild(document.createTextNode(p));
        else { var s = document.createElement("span"); s.className = "w"; s.textContent = p; frag.appendChild(s); }
      });
      node.parentNode.replaceChild(frag, node);
    });
  }
  var aboutBig = document.getElementById("aboutBig");
  if (aboutBig && hasGsap) splitWords(aboutBig);

  /* ---------- PRELOADER + intro ---------- */
  var pre = document.getElementById("preloader");
  var preCount = document.getElementById("preCount");
  var preBar = document.getElementById("preBar");
  var started = false;

  function begin() {
    if (started) return; started = true;
    if (pre) pre.classList.add("is-done");
    document.body.classList.add("loaded");
    heroIntro();
    if (hasGsap) setTimeout(function () { window.ScrollTrigger.refresh(); }, 350);
  }
  function heroIntro() {
    if (!hasGsap) return;
    gsap.timeline()
      .from(".hero__title .line__inner", { yPercent: 110, duration: 1.1, stagger: 0.09, ease: "power4.out" })
      .from(".hero__eyebrow", { opacity: 0, y: 22, duration: 0.7 }, "-=0.8")
      .from(".hero__role, .hero__lead", { opacity: 0, y: 22, duration: 0.7, stagger: 0.12 }, "-=0.6")
      .from(".hero__actions .btn", { opacity: 0, y: 22, duration: 0.6, stagger: 0.08 }, "-=0.5")
      .from(".hero__foot", { opacity: 0, duration: 0.8 }, "-=0.6");
  }

  if (hasGsap) {
    var obj = { v: 0 };
    gsap.to(obj, {
      v: 100, duration: 1.6, ease: "power2.inOut",
      onUpdate: function () {
        var val = Math.round(obj.v);
        if (preCount) preCount.textContent = (val < 10 ? "0" : "") + val;
        if (preBar) preBar.style.width = val + "%";
      },
      onComplete: function () { gsap.delayedCall(0.2, begin); }
    });
  } else {
    if (preCount) preCount.textContent = "100";
    if (preBar) preBar.style.width = "100%";
    begin();
  }
  setTimeout(begin, 3600); // seguro: nunca se queda colgado en el preloader

  /* ---------- SCROLL ANIMATIONS (GSAP) ---------- */
  if (hasGsap) {
    var ST = window.ScrollTrigger;

    /* reveal genérico */
    gsap.utils.toArray("[data-reveal]").forEach(function (el) {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" }
      });
    });

    /* parallax en las imagenes de la galeria */
    gsap.utils.toArray("[data-parallax-img]").forEach(function (img) {
      var sp = parseFloat(img.getAttribute("data-parallax-img")) || 0.12;
      gsap.fromTo(img, { yPercent: -(sp * 40) }, {
        yPercent: sp * 40, ease: "none",
        scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true }
      });
    });

    /* banda: marquee reactivo a la velocidad del scroll */
    var band = document.getElementById("bandTrack");
    if (band) {
      band.innerHTML = band.innerHTML + band.innerHTML + band.innerHTML + band.innerHTML;
      gsap.set(band, { xPercent: -12 });
      gsap.to(band, { xPercent: -58, ease: "none",
        scrollTrigger: { trigger: ".band", start: "top bottom", end: "bottom top", scrub: true } });
      var skewSetter = gsap.quickTo(band, "skewX", { duration: 0.45, ease: "power2" });
      ST.create({ onUpdate: function (self) { skewSetter(gsap.utils.clamp(-11, 11, self.getVelocity() / -260)); } });
    }

    /* Tarjetas de proyecto: se inclinan con el raton */
    if (fine) {
      gsap.utils.toArray(".proj").forEach(function (card) {
        gsap.set(card, { transformPerspective: 900 });
        var rx = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power3" });
        var ry = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power3" });
        card.addEventListener("pointermove", function (e) {
          var r = card.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * 8);
          rx(-((e.clientY - r.top) / r.height - 0.5) * 8);
        });
        card.addEventListener("pointerleave", function () { rx(0); ry(0); });
      });
    }

    /* galeria: magnet hacia el cursor */
    if (fine) {
      gsap.utils.toArray(".shot").forEach(function (shot) {
        var inner = shot.querySelector(".shot__inner");
        if (!inner) return;
        var qx = gsap.quickTo(inner, "xPercent", { duration: 0.6, ease: "power3" });
        var qy = gsap.quickTo(inner, "yPercent", { duration: 0.6, ease: "power3" });
        shot.addEventListener("pointermove", function (e) {
          var r = shot.getBoundingClientRect();
          qx(((e.clientX - r.left) / r.width - 0.5) * 9);
          qy(((e.clientY - r.top) / r.height - 0.5) * 9);
        });
        shot.addEventListener("pointerleave", function () { qx(0); qy(0); });
      });
    }

    /* hero se difumina al salir */
    gsap.to(".hero__content", {
      yPercent: 26, opacity: 0, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });

    /* palabras de "sobre mí" */
    if (aboutBig) {
      gsap.to("#aboutBig .w", {
        opacity: 1, ease: "none", stagger: 0.05,
        scrollTrigger: { trigger: "#aboutBig", start: "top 82%", end: "bottom 58%", scrub: true }
      });
    }

    /* parallax suave en cabeceras mega */
    gsap.utils.toArray(".mega").forEach(function (el) {
      gsap.fromTo(el, { yPercent: 12 }, {
        yPercent: -12, ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true }
      });
    });

    /* WORK: scroll horizontal anclado (solo desktop) */
    var track = document.getElementById("workTrack");
    var work = document.getElementById("work");
    if (track && work) {
      var mq = gsap.matchMedia();
      mq.add("(min-width: 901px)", function () {
        var getDist = function () { return Math.max(0, track.scrollWidth - window.innerWidth + 80); };
        gsap.to(track, {
          x: function () { return -getDist(); },
          ease: "none",
          scrollTrigger: {
            trigger: work, start: "top top",
            end: function () { return "+=" + getDist(); },
            pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1
          }
        });
      });
      mq.add("(max-width: 900px)", function () { work.classList.add("work--fallback"); });
    }

    /* botones magnéticos */
    if (fine) {
      gsap.utils.toArray(".magnetic").forEach(function (el) {
        el.addEventListener("pointermove", function (e) {
          var r = el.getBoundingClientRect();
          gsap.to(el, {
            x: (e.clientX - r.left - r.width / 2) * 0.35,
            y: (e.clientY - r.top - r.height / 2) * 0.45,
            duration: 0.4, ease: "power3.out"
          });
        });
        el.addEventListener("pointerleave", function () {
          gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "power3.out" });
        });
      });
    }

    /* refrescar al cargar del todo */
    window.addEventListener("load", function () { ST.refresh(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });
  }
})();
