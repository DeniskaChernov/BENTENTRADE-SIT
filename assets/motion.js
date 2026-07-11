/* Bententrade — macro motion: section rhythm, link polish, scroll progress. */
(function () {
  "use strict";
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  function initSectionRhythm() {
    document.querySelectorAll(".home-flow > section, .catalog-flow > section, .about-flow > section").forEach(function (sec, i) {
      sec.classList.add("flow-section");
      sec.style.setProperty("--flow-i", String(i));
    });
  }

  function initLinkPolish() {
    document.querySelectorAll(".nav a, .foot-col a, .blog-card__more").forEach(function (a) {
      if (a.classList.contains("motion-link")) return;
      a.classList.add("motion-link");
    });
  }

  function initScrollProgress() {
    var bar = document.querySelector("[data-scroll-progress]");
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "scroll-progress";
      bar.setAttribute("data-scroll-progress", "");
      bar.setAttribute("aria-hidden", "true");
      document.body.appendChild(bar);
    }
    var ticking = false;
    function update() {
      ticking = false;
      var doc = document.documentElement;
      var h = doc.scrollHeight - doc.clientHeight;
      var p = h > 0 ? doc.scrollTop / h : 0;
      bar.style.transform = "scaleX(" + Math.min(1, Math.max(0, p)).toFixed(4) + ")";
    }
    window.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    update();
  }

  function initChipSpring() {
    document.querySelectorAll(".chip").forEach(function (chip) {
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

  function run() {
    initSectionRhythm();
    initLinkPolish();
    initScrollProgress();
    initChipSpring();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();

  document.addEventListener("btt:lang", initLinkPolish);
  document.addEventListener("btt:related-rendered", initLinkPolish);
})();
