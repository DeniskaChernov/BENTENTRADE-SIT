/* Bententrade — 2026 motion engine
   1. Section rhythm & scroll-driven progress (with native compositor fallback).
   2. Magnetic elastic button attraction on desktop.
   3. Animated number roll counters.
   4. Tactile interactive spring feedback. */
(function () {
  "use strict";
  var mq = function(s) { return window.matchMedia && window.matchMedia(s).matches; };
  var reduced = mq("(prefers-reduced-motion: reduce)");
  var isTouch = mq("(hover: none)");
  if (reduced) return;

  function initSectionRhythm(root) {
    var scope = root || document;
    scope.querySelectorAll(".home-flow > section:not(.hero), .catalog-flow > section:not(.cat-top-bar), .about-flow > section:not(.ab-hero)").forEach(function (sec, i) {
      if (!sec.classList.contains("flow-section")) {
        sec.classList.add("flow-section");
        sec.style.setProperty("--flow-i", String(i));
      }
    });

    // Fallback reveal observer for browsers without native scroll-driven animations (e.g. Firefox)
    if (!window.CSS || !CSS.supports("(animation-timeline: view()) and (animation-range: entry)")) {
      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in");
              io.unobserve(entry.target);
            }
          });
        }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });

        scope.querySelectorAll(".flow-section, .product, .bento-tile, .scene-card, .cat-card").forEach(function (el) {
          io.observe(el);
        });
      }
    }
  }

  function initLinkPolish(root) {
    var scope = root || document;
    scope.querySelectorAll(".nav a, .foot-col a").forEach(function (a) {
      if (!a.classList.contains("motion-link")) a.classList.add("motion-link");
    });
  }

  /* ---------- Pure CSS Scroll-Driven Nano Reading Bar ---------- */
  function initScrollProgress() {
    if (reduced) return;
    var bar = document.querySelector(".scroll-progress-bar");
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "scroll-progress-bar";
      bar.setAttribute("aria-hidden", "true");
      document.body.prepend(bar);
    }
    // Fallback for browsers without animation-timeline: scroll()
    if (!window.CSS || !CSS.supports("animation-timeline: scroll()")) {
      var ticking = false;
      function updateBar() {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        var p = h > 0 ? window.scrollY / h : 0;
        bar.style.transform = "scaleX(" + Math.min(1, Math.max(0, p)).toFixed(4) + ")";
        ticking = false;
      }
      window.addEventListener("scroll", function () {
        if (!ticking) {
          requestAnimationFrame(updateBar);
          ticking = true;
        }
      }, { passive: true });
      updateBar();
    }
  }

  function initChipSpring() {
    document.querySelectorAll(".chip, .cat-chip").forEach(function (chip) {
      if (chip.dataset.springBound) return;
      chip.dataset.springBound = "1";
      chip.addEventListener("click", function () {
        chip.classList.remove("chip--pulse");
        void chip.offsetWidth;
        chip.classList.add("chip--pulse");
        chip.addEventListener("animationend", function () {
          chip.classList.remove("chip--pulse");
        }, { once: true });
      });
    });
  }

  /* ---------- Magnetic elastic button physics ---------- */
  function bindMagnetic(btn, strength) {
    if (isTouch || btn.dataset.magneticBound) return;
    btn.dataset.magneticBound = "1";
    var maxDist = strength || 6;
    var raf = null, mx = 0, my = 0;

    function frame() {
      btn.style.setProperty("--mag-x", mx.toFixed(1) + "px");
      btn.style.setProperty("--mag-y", my.toFixed(1) + "px");
      raf = null;
    }

    btn.addEventListener("mouseenter", function () {
      btn.classList.add("magnetic");
      btn.classList.remove("is-releasing");
    });

    btn.addEventListener("mousemove", function (e) {
      var rect = btn.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      mx = (e.clientX - cx) * 0.28;
      my = (e.clientY - cy) * 0.28;
      mx = Math.max(-maxDist, Math.min(maxDist, mx));
      my = Math.max(-maxDist, Math.min(maxDist, my));
      if (!raf) raf = requestAnimationFrame(frame);
    });

    btn.addEventListener("mouseleave", function () {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      mx = 0; my = 0;
      btn.classList.add("is-releasing");
      btn.style.setProperty("--mag-x", "0px");
      btn.style.setProperty("--mag-y", "0px");
      setTimeout(function () {
        btn.classList.remove("magnetic", "is-releasing");
      }, 500);
    });
  }

  function initMagnetic(root) {
    if (isTouch) return;
    var scope = root || document;
    scope.querySelectorAll(".product__media .add, .product__media .fav, .icon-btn, .btn--primary, .btn--copper, .btn--dark, .hero__cta, .drawer-x, .pdp-fav, [data-pdp-quick-buy], [data-qv-add], [data-qv-quick-buy], .material__cta").forEach(function (btn) {
      bindMagnetic(btn, 5);
    });
  }

  /* ---------- Animated number roll counter ---------- */
  function animateNumber(el, start, end, duration, formatFn) {
    if (reduced || start === end) {
      el.textContent = formatFn ? formatFn(end) : String(end);
      return;
    }
    var startTime = performance.now();
    var dur = duration || 360;
    function tick(now) {
      var progress = Math.min(1, (now - startTime) / dur);
      // easeOutCubic: 1 - pow(1 - x, 3)
      var ease = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(start + (end - start) * ease);
      el.textContent = formatFn ? formatFn(current) : String(current);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function viewTransition(fn) {
    if (document.startViewTransition && !reduced) {
      return document.startViewTransition(fn);
    }
    if (typeof fn === "function") fn();
  }

  /* ---------- 2026 Tactile Fluid Micro-Ripple ---------- */
  function initTactileRipples() {
    if (reduced || window._bttRippleBound) return;
    window._bttRippleBound = true;

    document.addEventListener("pointerdown", function (e) {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      var target = e.target && e.target.closest && e.target.closest(".btn, .chip, .cat-chip, .smart-toggle, .del-calc__city-btn, .co-msg, .co-city-chip, .filter-toggle-btn");
      if (!target) return;

      var rect = target.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height) * 1.6;
      var x = e.clientX - rect.left - size / 2;
      var y = e.clientY - rect.top - size / 2;

      var ripple = document.createElement("span");
      ripple.className = "btt-ripple";
      ripple.style.width = size.toFixed(0) + "px";
      ripple.style.height = size.toFixed(0) + "px";
      ripple.style.left = x.toFixed(0) + "px";
      ripple.style.top = y.toFixed(0) + "px";

      target.appendChild(ripple);
      setTimeout(function () {
        ripple.remove();
      }, 550);
    }, { passive: true });
  }

  /* ---------- Automated Stat Number Counters on Scroll ---------- */
  function initStatCounters(root) {
    if (reduced || !("IntersectionObserver" in window)) return;
    var scope = root || document;
    var statEls = scope.querySelectorAll(".about-stat-num, .about-value-num, .delivery-standard-num, .stat__num, .acc-stat .n, [data-stat-val]");
    if (!statEls.length) return;

    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        counterObserver.unobserve(el);
        if (el.dataset.counted === "1") return;
        el.dataset.counted = "1";

        var raw = el.textContent.trim();
        var match = raw.match(/^([^\d]*)([\d\s]+)([^\d]*)$/);
        if (!match) return;
        var prefix = match[1] || "";
        var numStr = match[2].replace(/\s+/g, "");
        var suffix = match[3] || "";
        var targetNum = parseInt(numStr, 10);
        if (isNaN(targetNum) || targetNum <= 0) return;

        animateNumber(el, 0, targetNum, Math.min(1100, 450 + targetNum * 6), function (val) {
          var formatted = val.toLocaleString("ru-RU");
          return prefix + formatted + suffix;
        });
      });
    }, { rootMargin: "0px 0px -5% 0px", threshold: 0.15 });

    statEls.forEach(function (el) {
      if (el.dataset.counted !== "1") counterObserver.observe(el);
    });
  }

  function run(root) {
    initSectionRhythm(root);
    initLinkPolish(root);
    initScrollProgress();
    initChipSpring();
    initMagnetic(root);
    initTactileRipples();
    initStatCounters(root);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { run(); });
  else run();

  document.addEventListener("btt:lang", function () { initLinkPolish(); });
  document.addEventListener("btt:related-rendered", function (e) {
    var grid = e.detail && e.detail.grid;
    run(grid);
  });

  window.BTT_MOTION = {
    refresh: run,
    initMagnetic: initMagnetic,
    animateNumber: animateNumber,
    viewTransition: viewTransition
  };
})();
