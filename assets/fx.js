/* Bententrade — 2026 luxury visual interactions layer
   1. Pointer-tracked perspective tilt & specular glare on media cards.
   2. Luxury ambient copper spotlight tracking cursor coordinates (--glow-x, --glow-y).
   3. Micro-sparkle particle burst engine on interactive clicks.
   Disabled for touch devices and prefers-reduced-motion. */
(function(){
  "use strict";
  const mq = s => window.matchMedia && window.matchMedia(s).matches;
  const isReduced = () => mq("(prefers-reduced-motion: reduce)");
  const isTouch = () => mq("(hover: none)");

  /* ---------- Micro-sparkle particle burst engine ---------- */
  let sparkleLayer = null;
  function getSparkleLayer(){
    if(!sparkleLayer){
      sparkleLayer = document.createElement("div");
      sparkleLayer.className = "sparkle-layer";
      sparkleLayer.setAttribute("aria-hidden", "true");
      document.body.appendChild(sparkleLayer);
    }
    return sparkleLayer;
  }

  function burstParticles(x, y, count = 7){
    if(isReduced()) return;
    const layer = getSparkleLayer();
    const colors = ["#ffb26b", "#e27c3d", "#f0d8c2", "#ffffff"];
    for(let i = 0; i < count; i++){
      const dot = document.createElement("span");
      dot.className = "spark-dot";
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const dist = 18 + Math.random() * 26;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      const size = 4 + Math.random() * 3.5;
      dot.style.left = (x - size / 2) + "px";
      dot.style.top = (y - size / 2) + "px";
      dot.style.width = size + "px";
      dot.style.height = size + "px";
      dot.style.setProperty("--dx", dx.toFixed(1) + "px");
      dot.style.setProperty("--dy", dy.toFixed(1) + "px");
      dot.style.background = colors[Math.floor(Math.random() * colors.length)];
      layer.appendChild(dot);
      setTimeout(() => dot.remove(), 480);
    }
  }

  /* ---------- 3D Perspective Tilt ---------- */
  function bindTilt(el, max){
    if(el.dataset.tiltBound === "1") return;
    el.dataset.tiltBound = "1";
    el.classList.add("tilt");
    const r = getComputedStyle(el).borderRadius;
    if(r && r !== "0px") el.style.clipPath = "inset(0 round " + r + ")";
    const glare = document.createElement("span");
    glare.className = "tilt__glare";
    el.appendChild(glare);

    let raf = null, px = .5, py = .5;
    function frame(){
      const rx = (py - .5) * -2 * max;
      const ry = (px - .5) *  2 * max;
      el.style.transform = "perspective(1000px) rotateX("+rx.toFixed(2)+"deg) rotateY("+ry.toFixed(2)+"deg) scale(1.012)";
      glare.style.background = "radial-gradient(circle at "+(px*100).toFixed(1)+"% "+(py*100).toFixed(1)+"%, rgba(255,255,255,.55), rgba(255,255,255,0) 55%)";
      raf = null;
    }
    el.addEventListener("mousemove", e=>{
      const rect = el.getBoundingClientRect();
      px = (e.clientX - rect.left) / rect.width;
      py = (e.clientY - rect.top)  / rect.height;
      el.classList.add("tilt--active");
      glare.style.opacity = .6;
      if(!raf) raf = requestAnimationFrame(frame);
    });
    el.addEventListener("mouseleave", ()=>{
      if(raf){ cancelAnimationFrame(raf); raf = null; }
      el.classList.remove("tilt--active");
      el.style.transform = "";
      glare.style.opacity = 0;
    });
  }

  /* ---------- Luxury Spotlight Border Glow ---------- */
  function bindSpotlight(el){
    if(el.dataset.spotlightBound === "1") return;
    el.dataset.spotlightBound = "1";
    let raf = null, x = -999, y = -999;
    function frame(){
      el.style.setProperty("--glow-x", x.toFixed(1) + "px");
      el.style.setProperty("--glow-y", y.toFixed(1) + "px");
      raf = null;
    }
    el.addEventListener("mousemove", e => {
      const rect = el.getBoundingClientRect();
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
      if(!raf) raf = requestAnimationFrame(frame);
    }, { passive: true });
    el.addEventListener("mouseleave", () => {
      if(raf){ cancelAnimationFrame(raf); raf = null; }
      el.style.removeProperty("--glow-x");
      el.style.removeProperty("--glow-y");
    }, { passive: true });
  }

  /* ---------- Clean up any legacy glow elements ---------- */
  function removeGlow(root){
    const scope = root || document;
    scope.querySelectorAll(".luxury-glow").forEach(el => el.remove());
  }

  /* ---------- Scan and wire interactive elements ---------- */
  function run(root){
    const scope = root || document;
    removeGlow(scope);

    if(!isReduced() && !isTouch()){
      // 3D perspective tilt
      scope.querySelectorAll(".product__media").forEach(el => bindTilt(el, 6));
      scope.querySelectorAll(".bento-tile:not(.bento-tile--pal), .mood-tile, .scene-card").forEach(el => bindTilt(el, 5));
      scope.querySelectorAll(".pdp-stage").forEach(el => bindTilt(el, 5));
      scope.querySelectorAll(".material__img").forEach(el => bindTilt(el, 4));
      scope.querySelectorAll(".cat-card, .cat-hero__preview, .blog-card, .type-card").forEach(el => bindTilt(el, 4));

      // Luxury ambient cursor spotlight
      scope.querySelectorAll(".product__media, .bento-tile, .scene-card, .cat-card, .info-card, .cat-hero__preview, .blog-card, .type-card, .faq-item").forEach(bindSpotlight);
    }
  }

  window.BTT_FX = {
    refresh: run,
    burstParticles: burstParticles
  };

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => run());
  else run();

  document.addEventListener("btt:related-rendered", (e) => {
    const grid = e.detail && e.detail.grid;
    if(grid) run(grid);
  });
  document.addEventListener("btt:cookies-accepted", () => run());
})();
