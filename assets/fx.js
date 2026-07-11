/* Bententrade — 3D interaction layer
   Pointer-tracked perspective tilt + specular glare on media cards.
   Disabled for touch devices and prefers-reduced-motion. */
(function(){
  "use strict";
  const mq = s => window.matchMedia && window.matchMedia(s).matches;
  const canTilt = !mq("(prefers-reduced-motion: reduce)") && !mq("(hover: none)");

  function bind(el, max){
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

  function run(root){
    if(!canTilt) return;
    const scope = root || document;
    scope.querySelectorAll(".product__media").forEach(el=>bind(el, 6));
    scope.querySelectorAll(".bento-tile:not(.bento-tile--pal), .mood-tile, .scene-card").forEach(el=>bind(el, 5));
    scope.querySelectorAll(".pdp-stage").forEach(el=>bind(el, 5));
    scope.querySelectorAll(".material__img").forEach(el=>bind(el, 4));
  }

  window.BTT_FX = { refresh: run };

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", ()=>run());
  else run();

  document.addEventListener("btt:related-rendered", (e)=>{
    const grid = e.detail && e.detail.grid;
    if(grid) run(grid);
  });
  document.addEventListener("btt:cookies-accepted", ()=>run());
})();
